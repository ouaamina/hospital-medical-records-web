import apiClient from '../api/apiClient';

describe('apiClient.ts', () => {
    it('doit être instancié avec la bonne URL de base', () => {
        expect(apiClient.defaults.baseURL).toBeDefined();
    });

    it('doit inclure les en-têtes par défaut (Content-Type)', () => {
        expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });
});