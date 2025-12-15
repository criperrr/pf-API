import { AppError } from "../types/ApiError.js";
import { NumberFilter, QueryFilter, StringFilter, YearInfo } from "../types/index.js";
import { AllYearsResponse } from "../types/dtos/nsac.dto.js";
import { checkNumberFilters, checkStringFilters } from "../utils/typeFilters.js";

export function filterQuery(grades: AllYearsResponse, query: QueryFilter): AllYearsResponse {
    console.log(query)
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
