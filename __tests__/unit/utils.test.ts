import * as errorUtils from './../../src/utils/errorUtils';

describe('Error utils tests', ()=>{

    test('Should return a not found error', ()=>{

        const result = errorUtils.notFoundError();
        expect(result).toEqual({type: 'not_found', message: ''});

    });

    test('Should return a conflict error', ()=>{

        const result = errorUtils.conflictError('Error message');
        expect(result).toEqual({type: 'conflict', message: 'Error message'});

    });

    test('Shoul test if it is an app error', ()=>{

        const appError = {type: 'not_found', message: 'Not found'};
        const notAppError = {message: 'Not found', other: 'Other property'};

        expect(errorUtils.isAppError(appError)).toBeTruthy();
        expect(errorUtils.isAppError(notAppError)).toBeFalsy();

    });

    test('Should return a unauthorized error', ()=>{

        const result = errorUtils.unauthorizedError();
        expect(result).toEqual({type: 'unauthorized', message: ''});

    });

    test('Should return a wrong schema error', ()=>{

        const result = errorUtils.wrongSchemaError();
        expect(result).toEqual({type: 'wrong_schema', message: ''});

    });

    test('Should return a status code from error type', ()=>{

        expect(errorUtils.errorTypeToStatusCode('conflict')).toBe(409);
        expect(errorUtils.errorTypeToStatusCode('not_found')).toBe(404);
        expect(errorUtils.errorTypeToStatusCode('unauthorized')).toBe(401);
        expect(errorUtils.errorTypeToStatusCode('wrong_schema')).toBe(422);

    });

});