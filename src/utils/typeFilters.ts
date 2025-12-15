import { AppError } from "../types/ApiError.js";
import { BooleanFilter, NumberFilter, StringFilter } from "../types/index.js";

function numericFilter(value: number, filter: NumberFilter | number): boolean {
    if (typeof filter === "number") {
        console.log(filter);
        return value === filter;
    }

    if (filter.eq !== undefined && value !== filter.eq) return false;
    if (filter.neq !== undefined && value === filter.neq) return false;
    if (filter.gt !== undefined && value <= filter.gt) return false;
    if (filter.gte !== undefined && value < filter.gte) return false;
    if (filter.lt !== undefined && value >= filter.lt) return false;
    if (filter.lte !== undefined && value > filter.lte) return false;

    return true;
}

function stringFilter(value: string, filter: StringFilter | string): boolean {
    if (typeof filter === "string") {
        return value === filter;
    }

    if (filter.eq !== undefined && value !== filter.eq) return false;
    if (filter.contains !== undefined && !value.includes(filter.contains)) return false;
    if (filter.startsWith !== undefined && !value.startsWith(filter.startsWith)) return false;

    return true;
}

function booleanFilter(value: boolean, filter: BooleanFilter | boolean): boolean {
    if (typeof filter === "boolean") return value === filter;

    if (filter.eq !== undefined && value !== filter.eq) return false;
    if (filter.neq !== undefined && value === filter.neq) return false;

    return true;
}

function parseBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return false;
    return value.toLowerCase() === "true";
}

export function checkBooleanFilters(value: boolean, filters: BooleanFilter | boolean): boolean {
    if (!Object.values(filters).some((val) => Array.isArray(val)))
        return booleanFilter(parseBoolean(value), filters);

    const flattenedFilters = Object.entries(filters).flatMap(([key, value]) => {
        const flatValues = Array.isArray(value) ? value.flat(Infinity) : [value];
        return flatValues.map((val) => ({ [key]: val }));
    });

    return flattenedFilters.some((filter) => booleanFilter(parseBoolean(value), filter));
}

export function checkStringFilters(value: string, filters: StringFilter | string): boolean {
    if (!Object.values(filters).some((val) => Array.isArray(val)))
        return stringFilter(value, filters);

    const flattenedFilters = Object.entries(filters).flatMap(([key, value]) => {
        const splitValues = Array.isArray(value)
            ? value.flatMap((val) => (typeof val === "string" ? val.split(",") : val))
            : [value];
        const flatValues = splitValues.flat(Infinity);
        console.log({ flatValues, splitValues });
        return flatValues.map((val) => ({ [key]: val }));
    });

    return flattenedFilters.some((filter) => stringFilter(value, filter));
}

export function checkNumberFilters(value: number, filters: NumberFilter | number): boolean {
    (Object.keys(filters) as (keyof NumberFilter)[]).forEach((key) => {
        if (typeof filters === "object" && filters !== null) {
            if (Array.isArray(filters[key])) {
                filters[key] = (filters[key] as number[]).map((filter: number) => {
                    const numberValue = Number(filter);
                    if (Number.isNaN(numberValue))
                        throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
                    return numberValue;
                }) as unknown as number;
            } else {
                filters[key] = Number(filters[key]);
                if (Number.isNaN(filters[key])) {
                    throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
                }
            }
        }
    });
    if (!Object.values(filters).some((val) => Array.isArray(val)))
        return numericFilter(value, filters);

    const flattenedFilters = Object.entries(filters).flatMap(([key, value]) => {
        const flatValues = Array.isArray(value) ? value.flat(Infinity) : [value];
        return flatValues.map((val) => ({ [key]: val }));
    });

    return flattenedFilters.some((filter) => numericFilter(value, filter));
}
