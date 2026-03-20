import openpyxl
import json

def categorize_excel(file_path):
    workbook = openpyxl.load_workbook(file_path)
    sheet = workbook.active
    data = []
    
    # Skip headers
    rows = list(sheet.iter_rows(values_only=True))
    for row in rows[3:]:
        name = row[0]
        sub_of = row[1]
        age = row[2]
        diag = row[3]
        type_si = row[4]
        basis = row[5]
        
        if name:
            data.append({
                "name": name,
                "category": type_si,
                "sub_of": sub_of
            })
    return data

if __name__ == "__main__":
    file_path = r"d:\Projects\Hospital-Project\hospital-selection\Specialitiesof Medicaine (1).xlsx"
    clean_data = categorize_excel(file_path)
    print(json.dumps(clean_data, indent=2))
