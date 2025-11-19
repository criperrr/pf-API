export default function verifyEmptyFields(
    fields: Record<string, string>
): Array<string> {
    let emptyFields: Array<string> = [];
    for (const key in fields) {
        if (!fields[`${key}`]) {
            emptyFields.push(`${key}`);
        }
    }
    return emptyFields;
}
