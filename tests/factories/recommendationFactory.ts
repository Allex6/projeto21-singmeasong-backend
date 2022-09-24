import { faker } from '@faker-js/faker';
import { CreateRecommendationData } from '../../src/services/recommendationsService';
import { Recommendation } from '@prisma/client';
import { prisma } from './../../src/database';

const DEFAULT_YOUTUBE_URL = 'https://www.youtube.com/watch?v=QH2-TGUlwu4';

function buildRecommendation(){

    const recommendation: CreateRecommendationData = {
        name: faker.name.firstName(),
        youtubeLink: DEFAULT_YOUTUBE_URL
    }

    return recommendation;

};

function buildRecommendationWithIdAndScore(){

    const recommendation: Recommendation = {
        name: faker.name.firstName(),
        youtubeLink: DEFAULT_YOUTUBE_URL,
        score: faker.datatype.number(),
        id: faker.datatype.number()
    }

    return recommendation;

};

function getRandomArray(arrayLenght: number = 10, buildWithId: boolean = true){

    const array = [];

    for (let i = 0; i < faker.datatype.number(arrayLenght); i++) {

        const recommendation = (buildWithId) ? buildRecommendationWithIdAndScore() : buildRecommendation();
        array.push(recommendation);
        
    }

    return array;

}

async function insertManyRecommendations(){

    const recommendations = getRandomArray(20, false);
    await prisma.recommendation.createMany({
        data: recommendations
    });

}

async function upvoteRecommendations() {
    
    const recommendations = await prisma.recommendation.findMany({
        take: 10,
        orderBy: { name: "asc" }
    });

    const recommendationsIds = recommendations.map((recommendation) => recommendation.id);

    await prisma.recommendation.updateMany({
        where: {
            id: {
                in: recommendationsIds
            }
        },
        data: {
            score: 50
        }
    });

}

async function downvoteRecommendations() {
    
    const recommendations = await prisma.recommendation.findMany({
        take: 10,
        orderBy: { name: "desc" }
    });

    const recommendationsIds = recommendations.map((recommendation) => recommendation.id);

    await prisma.recommendation.updateMany({
        where: {
            id: {
                in: recommendationsIds
            }
        },
        data: {
            score: -4
        }
    });

}

export {
    buildRecommendation,
    buildRecommendationWithIdAndScore,
    getRandomArray,
    insertManyRecommendations,
    upvoteRecommendations,
    downvoteRecommendations
}