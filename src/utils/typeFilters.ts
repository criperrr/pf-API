import { AppError } from "../types/ApiError.js";
import { BooleanFilter, NumberFilter, StringFilter } from "../types/index.js";

function removerAcentos(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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
    const parsedValue = removerAcentos(value).toLocaleLowerCase();
    if (typeof filter === "string") {
        return value === filter;
    }

    if (filter.eq !== undefined && parsedValue !== filter.eq) return false;
    if (filter.contains !== undefined && !parsedValue.includes(filter.contains)) return false;
    if (filter.startsWith !== undefined && !parsedValue.startsWith(filter.startsWith)) return false;

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
    const flattenedFilters = Object.entries(filters)
        .map(([key, value]) => {
            const splitValues = [removerAcentos(value).toLocaleLowerCase()].flat(Infinity);

            const flatValues = splitValues
                .map((val) => (typeof val === "string" ? val.trim().split(",") : val))
                .flat(Infinity);

            return flatValues.map((val) => {
                return { [key]: val };
            });
        })
        .flat(Infinity) as StringFilter[];

    return flattenedFilters.some((filter) => stringFilter(value, filter));
}

export function checkNumberFilters(value: number, filters: NumberFilter | number): boolean {
    const flattenedFilters = Object.entries(filters)
        .map(([key, value]) => {
            const splitValues = [value].flat(Infinity);

            const flatValues = splitValues
                .map((val) => (typeof val === "string" ? val.trim().split(",") : val))
                .flat(Infinity)
                .map((filter) => {
                    const numberValue = Number(filter);
                    if (Number.isNaN(numberValue))
                        throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
                    return numberValue;
                });

            return flatValues.map((val) => {
                return { [key]: val };
            });
        })
        .flat(Infinity) as NumberFilter[];
    console.log(flattenedFilters);

    return flattenedFilters.some((filter) => numericFilter(value, filter));
}
