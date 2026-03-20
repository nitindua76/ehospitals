import openpyxl
import json

def excel_to_json(file_path):
    workbook = openpyxl.load_workbook(file_path)
    sheet = workbook.active
    rows = []
    for row in sheet.iter_rows(values_only=True):
        rows.append(row)
    return rows

if __name__ == "__main__":
    file_path = r"d:\Projects\Hospital-Project\hospital-selection\Specialitiesof Medicaine (1).xlsx"
    data = excel_to_json(file_path)
    print(json.dumps(data[:10], indent=2))
