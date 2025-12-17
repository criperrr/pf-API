import {
    BooleanFilter,
    NumberFilter,
    QueryFilter,
    StringFilter,
    YearInfo,
} from "../types/index.js";
import { AllYearsResponse } from "../types/dtos/nsac.dto.js";
import {
    checkBooleanFilters,
    checkNumberFilters,
    checkStringFilters,
} from "../utils/typeFilters.js";

export function filterQuery(grades: AllYearsResponse, query: QueryFilter): AllYearsResponse {
    console.log(query);
    let filteredData: YearInfo[] = [...grades.data];

    if (query.schoolYear !== undefined) {
        const yearFilter = query.schoolYear as NumberFilter | Record<"0", number>;

        filteredData = filteredData.filter((_, i) => {
            console.log(i + 1, yearFilter);
            return checkNumberFilters(i + 1, yearFilter);
        });
    }

    if (query.targetBimester !== undefined) {
        const bimesterFilter = query.targetBimester as NumberFilter | Record<"0", number>;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((_, i) => {
                    return checkNumberFilters(i + 1, bimesterFilter);
                });
                return fullGrades.bimesters.length > 0;
            });

            yearInfo.bimestersMetrics = yearInfo.bimestersMetrics.filter((_, i) => {
                return checkNumberFilters(i + 1, bimesterFilter);
            });

            return yearInfo;
        });
    }

    if (query.subjectName !== undefined) {
        const subjectFilter = query.subjectName as StringFilter | Record<"0", string>;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades, i) => {
                return checkStringFilters(fullGrades.subjectName.toLowerCase(), subjectFilter);
            });
            return yearInfo;
        });
    }

    if (query.classAverage !== undefined) {
        const classAverageFilter = query.grade as NumberFilter | Record<"0", number>;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((bimester) => {
                    return checkNumberFilters(bimester.personal.grade, classAverageFilter);
                });
                return fullGrades.bimesters.length > 0;
            });

            return yearInfo;
        });
    }

    if (query.isRecovery !== undefined) {
        const isRecoveryFilter = query.isRecovery as BooleanFilter | boolean;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((bimester) => {
                    return checkBooleanFilters(bimester.personal.recovery, isRecoveryFilter);
                });
                return fullGrades.bimesters.length > 0;
            });

            return yearInfo;
        });
    }

    if (query.grade !== undefined) {
        const gradeFilter = query.grade as NumberFilter | Record<"0", number>;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((bimester) => {
                    return checkNumberFilters(bimester.personal.grade, gradeFilter);
                });
                return fullGrades.bimesters.length > 0;
            });

            return yearInfo;
        });
    }

    if (query.recoveryCode !== undefined) {
        const recoveryCodeFilter = query.recoveryCode as StringFilter | Record<"0", string>;

        filteredData = filteredData.map((yearInfo) => {
            yearInfo.grades = yearInfo.grades.filter((fullGrades) => {
                fullGrades.bimesters = fullGrades.bimesters.filter((bimester) => {
                    console.log(bimester.personal.recoveryCode, recoveryCodeFilter);
                    if (bimester.personal.recoveryCode) {
                        console.log(
                            checkStringFilters(bimester.personal.recoveryCode, recoveryCodeFilter)
                        );
                        return checkStringFilters(
                            bimester.personal.recoveryCode,
                            recoveryCodeFilter
                        );
                    } else {
                        console.log(checkStringFilters("NAC", recoveryCodeFilter));
                        return checkStringFilters("NAC", recoveryCodeFilter);
                    }
                });
                return fullGrades.bimesters.length > 0
            });
            return yearInfo;
        });
    }

    return {
        ...grades,
        data: filteredData,
    };
}
