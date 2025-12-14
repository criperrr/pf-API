import { AppError } from "../types/ApiError.js";
import { AllYearsInfo, NumberFilter, QueryFilter, StringFilter, YearInfo } from "../types/index.js";

function checkStringFilters(value: string, filters: StringFilter | string): boolean {
    if (!Object.values(filters).some((val) => Array.isArray(val)))
        return stringFilter(value, filters);

    return Object.values(filters)
        .flat(Infinity)
        .some((filter) => stringFilter(value, filter));
}

function checkNumberFilters(value: number, filters: NumberFilter | number): boolean {
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

    return Object.values(filters)
        .flat(Infinity)
        .some((filter) => numericFilter(value, filter));
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
    if (typeof filter === "string") {
        return value === filter;
    }

    if (filter.eq !== undefined && value !== filter.eq) return false;
    if (filter.contains !== undefined && !value.includes(filter.contains)) return false;
    if (filter.startsWith !== undefined && !value.startsWith(filter.startsWith)) return false;

    return true;
}

export function filterQuery(grades: AllYearsInfo, query: QueryFilter): AllYearsInfo {
    let filteredData: YearInfo[] = [...grades.data];

    if (query.schoolYear !== undefined) {
        const yearFilter = query.schoolYear as NumberFilter | number;

        filteredData = filteredData.filter((_, i) => {
            console.log(i + 1, yearFilter);
            return checkNumberFilters(i + 1, yearFilter);
        });
    }

    if (query.targetBimester !== undefined) {
        const bimesterFilter = query.targetBimester as NumberFilter | number;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.map((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((_, i) => {
                    return checkNumberFilters(i + 1, bimesterFilter);
                });
                return fullGrades;
            });

            yearInfo.bimestersMetrics = yearInfo.bimestersMetrics.filter((_, i) => {
                return checkNumberFilters(i + 1, bimesterFilter);
            });

            return yearInfo;
        });
    }

    if (query.subjectName !== undefined) {
        const subjectFilter = query.subjectName as StringFilter | string;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades, i) => {
                return checkStringFilters(fullGrades.subjectName, subjectFilter);
            });
            return yearInfo;
        });
    }
    return {
        ...grades,
        data: filteredData,
    };
}
