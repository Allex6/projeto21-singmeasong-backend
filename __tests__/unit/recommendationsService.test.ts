import { recommendationService } from './../../src/services/recommendationsService';
import { buildRecommendation, buildRecommendationWithIdAndScore, getRandomArray } from '../factories/recommendationFactory';
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { conflictError, notFoundError } from './../../src/utils/errorUtils';

describe('recommendations service unit tests', ()=>{

    jest.spyOn(recommendationRepository, 'create').mockResolvedValue();
    
    test('Should insert a new recommendation', async ()=>{

        const recommendation = buildRecommendation();
        jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce(null);

        const result = await recommendationService.insert(recommendation);
        expect(recommendationRepository.create).toBeCalled();
        expect(recommendationRepository.create).toBeCalledWith(recommendation);
        expect(result).toBeUndefined();

    });

    test('Should fail to insert new recommendation and throw conclit error', async ()=>{

        const insertedRecommendation = buildRecommendationWithIdAndScore();
        const recommendation = buildRecommendation();

        jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce(insertedRecommendation);

        try {
            await recommendationService.insert(recommendation);
        } catch (err) {
            expect(err).toEqual(conflictError('Recommendations names must be unique'));
        }

    });

    test('Should upvote a recommendation', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(undefined);

        const result = await recommendationService.upvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalledWith(recommendation.id, 'increment');
        expect(result).toBeUndefined();

    });

    test('Should fail to upvote a recommendation and throw not found error', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

        try {
            await recommendationService.upvote(recommendation.id);
        } catch (err) {
            expect(err).toEqual(notFoundError());
        }

    });
    
    test('Should downvote a recommendation', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendation);

        const result = await recommendationService.downvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalledWith(recommendation.id, 'decrement');
        expect(result).toBeUndefined();

    });

    test('Should fail to downvote a recommendation and throw not found error', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

        try {
            await recommendationService.downvote(recommendation.id);
        } catch (err) {
            expect(err).toEqual(notFoundError());
        }

    });

    test('Should downvote a recommendation and remove it', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        recommendation.score = -6;

        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
        jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendation);
        jest.spyOn(recommendationRepository, 'remove').mockResolvedValueOnce(undefined);

        const result = await recommendationService.downvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.updateScore).toBeCalledWith(recommendation.id, 'decrement');
        expect(recommendationRepository.remove).toBeCalled();
        expect(recommendationRepository.remove).toBeCalledWith(recommendation.id);
        expect(result).toBeUndefined();

    });

    test('Should get a recommendation by id', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);

        const result = await recommendationService.getById(recommendation.id);
        expect(recommendationRepository.find).toBeCalled();
        expect(recommendationRepository.find).toBeCalledWith(recommendation.id);
        expect(result).toBe(recommendation);

    });

    test('Should fail to find a recommendation by id and throw not found error', async ()=>{

        const recommendation = buildRecommendationWithIdAndScore();
        jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

        try {
            await recommendationService.getById(recommendation.id);
        } catch (err) {
            expect(err).toEqual(notFoundError());
        }

    });

    test('Should get all recommendations', async ()=>{

        const recommendations = getRandomArray();

        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.get();
        expect(recommendationRepository.findAll).toBeCalled();
        expect(result).toBe(recommendations);
        expect(result.length).toBe(recommendations.length);

    });

    test('Should get top recommendations', async ()=>{

        const recommendations = getRandomArray();

        recommendations.sort((a, b) => b.score - a.score);
        const topThree = recommendations.slice(0, 3);

        jest.spyOn(recommendationRepository, 'getAmountByScore').mockResolvedValueOnce(topThree);

        const result = await recommendationService.getTop(topThree.length);
        expect(recommendationRepository.getAmountByScore).toBeCalled();
        expect(result).toBe(topThree);
        expect(result.length).toBe(topThree.length);


    });

    test('Should get random recommendations', async ()=>{

        const recommendations = getRandomArray();

        const DEFAULT_RANDOM_VALUE = 0.5;
        const DEFAULT_INDEX = Math.floor(DEFAULT_RANDOM_VALUE * recommendations.length);

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.getRandom();
        expect(result).toBe(recommendations[DEFAULT_INDEX]);

    });

    test('Should get random recommendations with score greater than 10', async ()=>{

        const recommendations = getRandomArray();

        const DEFAULT_RANDOM_VALUE = 0.5;
        const DEFAULT_INDEX = Math.floor(DEFAULT_RANDOM_VALUE * recommendations.length);

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.getRandom();
        expect(result).toBe(recommendations[DEFAULT_INDEX]);

    });

    test('Should get random recommendations with score greater than 10 when random is less than 0.7', async ()=>{

        const recommendations = getRandomArray();

        const DEFAULT_RANDOM_VALUE = 0.5;
        const DEFAULT_INDEX = Math.floor(DEFAULT_RANDOM_VALUE * recommendations.length);

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.getRandom();
        expect(result).toBe(recommendations[DEFAULT_INDEX]);

    });

    test('Should get random recommendations with score less than or equal to 10 when random is greater than 0.7', async ()=>{

        const recommendations = getRandomArray();

        const DEFAULT_RANDOM_VALUE = 0.9;
        const DEFAULT_INDEX = Math.floor(DEFAULT_RANDOM_VALUE * recommendations.length);

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.getRandom();
        expect(result).toBe(recommendations[DEFAULT_INDEX]);

    });

    test('Should fail to get random recommendations and throw not found error', async ()=>{

        const recommendations = [];
        const DEFAULT_RANDOM_VALUE = 0.9;

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        try {
            await recommendationService.getRandom();
        } catch (err) {
            expect(err).toEqual(notFoundError());
        }

    });

    test('Should return all recommendations when score filter is not applied', async ()=>{

        const recommendations = getRandomArray();

        const DEFAULT_RANDOM_VALUE = 0.9;
        const DEFAULT_INDEX = Math.floor(DEFAULT_RANDOM_VALUE * recommendations.length);

        jest.spyOn(global.Math, 'random').mockReturnValue(DEFAULT_RANDOM_VALUE);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([]);
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

        const result = await recommendationService.getRandom();
        expect(result).toBe(recommendations[DEFAULT_INDEX]);

    });

});