import { AppError } from "../types/ApiError.js";
import { AllYearsInfo, NumberFilter, QueryFilter, YearInfo } from "../types/index.js";



function checkNumberFilters(value: number, filters: NumberFilter | number): boolean {
    console.log(filters);
    (Object.keys(filters) as (keyof NumberFilter)[]).forEach((key) => {
        if (typeof filters === "object" && filters !== null) {
            filters[key] = Number(filters[key]);
            if (Number.isNaN(filters[key]))
                throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
        }
    });
    if (!(Object.values(filters).some(val => Array.isArray(val)))) return numericFilter(value, filters);
    return Object.values(filters).some((filter) => numericFilter(value, filter));
}

function numericFilter(value: number, filter: NumberFilter | number): boolean {
    if (typeof filter === "number") {
        return value === filter;
    }
    console.log({ value, filter });
    if (filter.eq !== undefined && value !== filter.eq) {
        console.log("eq");
        return false;
    }

    if (filter.neq !== undefined && value === filter.neq) return false;

    if (filter.gt !== undefined && value <= filter.gt) return false;

    if (filter.gte !== undefined && value < filter.gte) return false;

    if (filter.lt !== undefined && value >= filter.lt) return false;

    if (filter.lte !== undefined && value > filter.lte) return false;

    return true;
}

export function filterQuery(grades: AllYearsInfo, query: QueryFilter): AllYearsInfo {
    let filteredData: YearInfo[] = [...grades.data];
    if (query.schoolYear !== undefined) {
        const yearFilter = query.schoolYear as NumberFilter | number;
        filteredData = filteredData.filter((yearInfo, i) => {
            return checkNumberFilters(i + 1, yearFilter);
        });
    }
    console.log(query);
    console.log(filteredData);
    return {
        ...grades,
        data: filteredData,
    };
}
