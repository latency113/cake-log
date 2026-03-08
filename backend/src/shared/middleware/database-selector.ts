import { Elysia } from "elysia";
import { databaseContext } from "../../providers/database/database.context";

export const databaseSelector = new Elysia()
    .onRequest(({ request }) => {
        const year = request.headers.get("x-academic-year") || "current";
        // console.log(`[DatabaseSelector] Request URL: ${request.url}, Header Year: ${request.headers.get("x-academic-year")}, Final Year: ${year}`);
        databaseContext.enterWith(year);
    });
