import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';
import { RegisterDto, LoginDto } from "../src/auth/dto";
import { InfluxDB } from '@influxdata/influxdb-client';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const baseUrl = 'http://localhost:3333';
  const registerDto: RegisterDto = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'SYSTEM_ADMIN', 
  };

  const loginDto: LoginDto = {
    email: 'admin@example.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb?.(); // Eğer cleanDb() metodun varsa (opsiyonel)

    pactum.request.setBaseUrl(baseUrl);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Register', () => {
    it('should throw if email is missing', () => {
      const invalid: Partial<RegisterDto> = { ...registerDto };
      delete invalid.email;
      return pactum.spec()
        .post('/auth/register')
        .withBody(invalid)
        .expectStatus(400);
    });

    it('should throw if password is missing', () => {
       const invalid: Partial<RegisterDto> = { ...registerDto };
       delete invalid.password;
      return pactum.spec()
        .post('/auth/register')
        .withBody(invalid)
        .expectStatus(400);
    });

    it('should register successfully', () => {
      return pactum.spec()
        .post('/auth/register')
        .withBody(registerDto)
        .expectStatus(201)
        .stores('accessToken', 'access_token');
    });

    it('should throw if registering same email again', () => {
      return pactum.spec()
        .post('/auth/register')
        .withBody(registerDto)
        .expectStatus(400);
    });
  });

  describe('Login', () => {
    it('should throw if email is missing', () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody({ password: loginDto.password })
        .expectStatus(400);
    });

    it('should throw if password is missing', () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody({ email: loginDto.email })
        .expectStatus(400);
    });

    it('should login successfully', () => {
      return pactum.spec()
        .post('/auth/login')
        .withBody(loginDto)
        .expectStatus(200)
        .stores('accessToken', 'access_token');
    });
  });

  describe('Protected Route - Create User', () => {
    it('should fail if no token provided', () => {
      return pactum.spec()
        .post('/auth/create-user')
        .expectStatus(401);
    });

    it('should create user successfully (System Admin)', () => {
      return pactum.spec()
        .post('/auth/create-user')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody({
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password',
          role: 'USER',
          companyId: null,
        })
        .expectStatus(201);
    });
  });

  describe('Company', () => {
    let companyId: number;
    const createDto = { name: 'Test Company' };
    const updateDto = { name: 'Updated Company' };
  
    it('should create a company', () => {
      return pactum.spec()
        .post('/company')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody(createDto)
        .expectStatus(201)
        .stores('companyId', 'id') // Store ID for later use
        .inspect();
    });
  
    it('should get all companies', () => {
      return pactum.spec()
        .get('/company')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectJsonLike([{
          id: '$S{companyId}',
          name: createDto.name,
        }])
        .inspect();
    });
  
    it('should get company by ID', () => {
      return pactum.spec()
        .get('/company/$S{companyId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectBodyContains(createDto.name)
        .inspect();
    });
  
    it('should update company', () => {
      return pactum.spec()
        .put('/company/$S{companyId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody(updateDto)
        .expectStatus(200)
        .expectBodyContains(updateDto.name)
        .inspect();
    });
  
    it('should delete company', () => {
      return pactum.spec()
        .delete('/company/$S{companyId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .inspect();
    });
  
    it('should throw 404 when getting deleted company', () => {
      return pactum.spec()
        .get('/company/$S{companyId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(404);
    });
  });

  describe('SensorData', () => {
    let sensorDataId: number;
    let influxdb: InfluxDB;
    const sensorDataDto = {
      sensorId: 'test_sensor_01',
      timestamp: new Date().toISOString(),
      temperature: 22.5,
      humidity: 55,
    };
  
    beforeAll(async () => {
      if (!process.env.INFLUXDB_URL) {
        throw new Error('INFLUXDB_URL environment variable is not defined');
      }
      influxdb = new InfluxDB({ url: process.env.INFLUXDB_URL,token: process.env.INFLUXDB_TOKEN, });
    });

    afterAll(async () => {
      if (!process.env.INFLUXDB_ORG || !process.env.INFLUXDB_BUCKET) {
        throw new Error('InfluxDB environment variables are not defined');
      }
      const queryApi = influxdb.getQueryApi(process.env.INFLUXDB_ORG);
      await queryApi.queryRaw(`from(bucket:"${process.env.INFLUXDB_BUCKET}") |> range(start: 0) |> filter(fn: (r) => r["sensorId"] == "${sensorDataDto.sensorId}") |> drop()`);
    });
  
    it('should create sensor data', () => {
      return pactum.spec()
        .post('/sensor-data')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody(sensorDataDto)
        .expectStatus(201)
        .expectBodyContains(sensorDataDto.sensorId)
        .stores('sensorDataId', 'id')
        .inspect();
    });
  
    it('should get all sensor data', () => {
      return pactum.spec()
        .get('/sensor-data')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectJsonLike([{
          id: '$S{sensorDataId}',
          sensorId: sensorDataDto.sensorId,
        }])
        .inspect();
    });

    it('should get sensor data by ID', () => {
      return pactum.spec()
        .get('/sensor-data/$S{sensorDataId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectBodyContains(sensorDataDto.sensorId)
        .inspect();
    });

    it('should get sensor data by time range', () => {
      const startTime = new Date(Date.now() - 3600000).toISOString(); // 1 saat önce
      const endTime = new Date().toISOString();
      
      return pactum.spec()
        .get('/sensor-data/range')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withQueryParams({
          startTime,
          endTime,
          sensorId: sensorDataDto.sensorId,
        })
        .expectStatus(200)
        .expectJsonLike([{
          sensorId: sensorDataDto.sensorId,
        }])
        .inspect();
    });

    it('should delete sensor data', () => {
      return pactum.spec()
        .delete('/sensor-data/$S{sensorDataId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .inspect();
    });

    it('should throw 404 when getting deleted sensor data', () => {
      return pactum.spec()
        .get('/sensor-data/$S{sensorDataId}')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(404);
    });
  });

  describe('LogView', () => {
    it('should create a log view', () => {
      return pactum.spec()
        .post('/log-view')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody({
          userId: 1, // İstersen önce Userları çekip dinamik yapabilirsin
          action: 'viewed_logs',
        })
        .expectStatus(201)
        .expectBodyContains('viewed_logs')
        .stores('logViewId', 'id')
        .inspect();
    });
  
    it('should get all log views', () => {
      return pactum.spec()
        .get('/log-view')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectJsonLike([
          {
            id: '$S{logViewId}',
            action: 'viewed_logs',
          },
        ])
        .inspect();
    });
  });

  describe('MQTT', () => {
    const mqttTopic = 'test/topic';
    const mqttMessage = {
      sensorId: 'test_sensor_01',
      value: 25.5,
      timestamp: new Date().toISOString()
    };

    it('should check MQTT connection status', () => {
      return pactum.spec()
        .get('/mqtt/status')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .expectBodyContains('connected')
        .inspect();
    });

    it('should publish message to MQTT topic', () => {
      return pactum.spec()
        .post('/mqtt/publish')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withBody(mqttMessage)
        .expectStatus(201)
        .expectBodyContains('published')
        .inspect();
    });

    it('should subscribe to MQTT topic', () => {
      return pactum.spec()
        .get('/mqtt/subscribe')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .withQueryParams({ topic: mqttTopic })
        .expectStatus(200)
        .expectBodyContains('subscribed')
        .inspect();
    });

    it('should fail to publish without authentication', () => {
      return pactum.spec()
        .post('/mqtt/publish')
        .withBody(mqttMessage)
        .expectStatus(401)
        .inspect();
    });
  });

  describe('Rate Limiting', () => {
    const endpoint = '/sensor-data';
    const maxRequests = 10; // Rate limit değeri

    it('should allow requests within rate limit', async () => {
      const requests = Array(maxRequests).fill(null).map(() => 
        pactum.spec()
          .get(endpoint)
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
      );

      await Promise.all(requests);
    });

    it('should block requests exceeding rate limit', async () => {
      const requests = Array(maxRequests + 1).fill(null).map(() => 
        pactum.spec()
          .get(endpoint)
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
      );

      const results = await Promise.all(requests);
      const blockedRequests = results.filter(r => r.status === 429);
      
      expect(blockedRequests.length).toBeGreaterThan(0);
    });

    it('should reset rate limit after time window', async () => {
      await Promise.all(
        Array(maxRequests).fill(null).map(() => 
          pactum.spec()
            .get(endpoint)
            .withHeaders({
              Authorization: 'Bearer $S{accessToken}',
            })
        )
      );

      await new Promise(resolve => setTimeout(resolve, 60000));

      // Yeni istekler yap
      const response = await pactum.spec()
        .get(endpoint)
        .withHeaders({
          Authorization: 'Bearer $S{accessToken}',
        })
        .expectStatus(200)
        .inspect();
    });

    it('should apply different rate limits for different endpoints', async () => {
      const endpoints = ['/sensor-data', '/company', '/log-view'];
      const requests = endpoints.map(endpoint => 
        pactum.spec()
          .get(endpoint)
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
      );

      await Promise.all(requests);
    });
  });
});

