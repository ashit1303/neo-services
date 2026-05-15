
export const downloadCSVExportFileToS3CHSQL = `
INSERT INTO FUNCTION s3(
  'https://{{bucket}}.s3.amazonaws.com/{{fileName}}',
  'CSVWithNames',
  extra_credentials( role_arn = '{{roleS3ARN}}' )
)
  --add query here 

{{query}}

`;

export const downloadCSVExportFileToS3DDSQL = `COPY (
  {{query}}
)
TO 's3://{{bucket}}/{{fileName}}.csv'
(FORMAT CSV, HEADER);
`;
