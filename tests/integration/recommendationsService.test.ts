import app from './../../src/app';
import supertest from 'supertest';
import { prisma } from './../../src/database';
import { faker } from '@faker-js/faker';
import { buildRecommendation, insertManyRecommendations, upvoteRecommendations } from '../factories/recommendationFactory';

const agent = supertest(app);

afterAll(async ()=>{
    await prisma.recommendation.deleteMany();
    await prisma.$disconnect();
});

describe('Recommendations routes tests', ()=>{

    test('POST /recommendations - should answer with status 422 when name is not provided', async ()=>{

        const body = {
            youtubeLink: faker.internet.url()
        };

        const response = await agent.post('/recommendations').send(body);
        expect(response.status).toBe(422);

    });

    test('POST /recommendations - should answer with status 422 when youtubeLink is not provided', async ()=>{

        const body = {
            name: faker.name.firstName()
        };

        const response = await agent.post('/recommendations').send(body);
        expect(response.status).toBe(422);

    });

    test('POST /recommendations - should create a new recommendation and answer with status 201', async ()=>{

        const body = buildRecommendation();
        const response = await agent.post('/recommendations').send(body);
        expect(response.status).toBe(201);

    });

    test('GET /recommendations - should return a list of recommendations and status 200', async ()=>{

        const response = await agent.get('/recommendations');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);

    });

    test('GET /recommendations/random - should return a random recommendation and status 200', async ()=>{

        const response = await agent.get('/recommendations/random');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('youtubeLink');
        expect(response.body).toHaveProperty('score');
        expect(response.body).toHaveProperty('id');

    });

    test('GET /recommendations/top/:amount - should return a list of recommendations and status 200', async ()=>{

        await insertManyRecommendations();
        await upvoteRecommendations();
        const amount = 5;
        const response = await agent.get(`/recommendations/top/${amount}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(amount);

    });

    test('GET /recommendations/top/:amount - should return an empty list of recommendations and status 200', async ()=>{

        const amount = 0;
        const response = await agent.get(`/recommendations/top/${amount}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(0);

    });

    test('GET /recommendations/:id - should return a recommendation and status 200', async ()=>{

        const recommendation = await prisma.recommendation.findFirst();
        const response = await agent.get(`/recommendations/${recommendation.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('youtubeLink');
        expect(response.body).toHaveProperty('score');
        expect(response.body).toHaveProperty('id');

    });

    test('GET /recommendations/:id - should return status 404 when recommendation does not exist', async ()=>{

        const response = await agent.get(`/recommendations/99999999`);
        expect(response.status).toBe(404);

    });

    test('POST /recommendations/:id/upvote - should answer with status 200', async ()=>{

        const recommendation = await prisma.recommendation.findFirst();
        const response = await agent.post(`/recommendations/${recommendation.id}/upvote`);
        expect(response.status).toBe(200);

    });

    test('POST /recommendations/:id/upvote - should answer with status 404 when recommendation does not exist', async ()=>{

        const response = await agent.post(`/recommendations/99999999/upvote`);
        expect(response.status).toBe(404);

    });

    test('POST /recommendations/:id/downvote - should answer with status 200', async ()=>{

        const recommendation = await prisma.recommendation.findFirst();
        const response = await agent.post(`/recommendations/${recommendation.id}/downvote`);
        expect(response.status).toBe(200);

    });

    test('POST /recommendations/:id/downvote - should answer with status 404 when recommendation does not exist', async ()=>{

        const response = await agent.post(`/recommendations/99999999/downvote`);
        expect(response.status).toBe(404);

    });

    test('POST /recommendations/:id/downvote - should answer with status 200 and remove recommendation when score is -5', async ()=>{

        const newRecommendation = buildRecommendation();
        const recommendationToBeSaved = {
            ...newRecommendation,
            score: -4
        };

        await prisma.recommendation.create({
            data: recommendationToBeSaved
        });

        const recommendation = await prisma.recommendation.findFirst({
            where: {
                score: { lte: -4 }
            }
        });

        const response = await agent.post(`/recommendations/${recommendation.id}/downvote`);
        expect(response.status).toBe(200);

    });

    test('GET /recommendations/random - should return status 404 when there are no recommendations', async ()=>{

        await prisma.recommendation.deleteMany();
        const response = await agent.get('/recommendations/random');
        expect(response.status).toBe(404);

    });

});