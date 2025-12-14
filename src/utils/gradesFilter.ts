import { AppError } from "../types/ApiError.js";
import { AllYearsInfo, NumberFilter, QueryFilter, YearInfo } from "../types/index.js";

function checkNumberFilters(value: number, filters: NumberFilter | number): boolean {
    (Object.keys(filters) as (keyof NumberFilter)[]).forEach((key) => {
        if (typeof filters === "object" && filters !== null) {
            console.log(filters);
            if (Array.isArray(filters[key])) {
                filters[key] = (filters[key] as unknown as number[]).map((filter) => {
                    const numberValue = Number(filter);
                    if (Number.isNaN(numberValue))
                        throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
                    return numberValue;
                }) as unknown as number;
            } else {
                filters[key] = Number(filters[key]);
                if (Number.isNaN(filters[key])) {
                    console.log(filters);
                    throw new AppError("Invalid input parameters", 400, "INVALID_PARAMS");
                }
            }
        }
    });
    if (!Object.values(filters).some((val) => Array.isArray(val)))
        return numericFilter(value, filters);
    return Object.values(filters).some((filter) => numericFilter(value, filter));
}

function numericFilter(value: number, filter: NumberFilter | number): boolean {
    if (typeof filter === "number") {
        return value === filter;
    }
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
            console.log(i + 1, yearFilter);
            return checkNumberFilters(i + 1, yearFilter);
        });
    }
    if (query.targetBimester !== undefined) {
        const bimesterFilter = query.targetBimester as NumberFilter | number;
        filteredData.forEach((yearInfo, _) => {});
    }
    return {
        ...grades,
        data: filteredData,
    };
}
