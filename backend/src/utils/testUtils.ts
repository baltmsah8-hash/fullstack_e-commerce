import type { Request, Response } from "express";
import { jest } from "@jest/globals";

export const createRequest = (overrides: Partial<Request> = {}): Request =>
    ({
        body: {},
        params: {},
        headers: {},
        ...overrides,
    }) as Request;

export const createResponse = () => {
    const response = {
        status: jest.fn(),
        json: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    };

    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    response.cookie.mockReturnValue(response);
    response.clearCookie.mockReturnValue(response);

    return { response: response as unknown as Response, ...response };
};
