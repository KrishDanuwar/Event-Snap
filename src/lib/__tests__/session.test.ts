import { describe, it, expect } from 'vitest';
import { ApiError } from '../session';

describe('Session Utilities', () => {
   
   it('should instantiate an ApiError with proper status codes', () => {
       const error = new ApiError(403, 'Forbidden');
       expect(error.message).toBe('Forbidden');
       expect(error.statusCode).toBe(403);
       expect(error.name).toBe('ApiError');
   });

});
