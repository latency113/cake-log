import { PrismaClient } from "./generated/client";
import { getClient } from "./connection-manager";
import { getAcademicYear } from "./database.context";

// Create a Proxy to intercept all property accesses
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const year = getAcademicYear();
    const client = getClient(year);
    
    // Access the property on the correct client instance
    const value = client[prop as keyof PrismaClient];
    
    // If the value is a function, bind it to the client instance
    if (typeof value === 'function') {
        return value.bind(client);
    }
    
    return value;
  }
});

export default prisma;