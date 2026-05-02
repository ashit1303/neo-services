
// export const AlertRequestValidation = z.enum(['COMPONENT', 'SEVERITY', 'STATUS'], { message: 'alert type is required' });

// export const TripIdValidation = z.string({ message: 'trip id is required' }).max(32, { message: 'trip id must be less than 32 characters' });
// export const AlertSeverityValidation = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], { message: 'alert severity is required' });

// export const AlertChannelValidation = z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'APP', 'WEB'], { message: 'alert channel is required' }).optional();

// export const AlertComponentValidation = z.enum(['BMS', 'MCU', 'VCU', 'CHARGER', 'GEOFENCE', 'IGNITION'], { message: 'alert component is required' });

// export const LimitValidation = z.number({ message: 'limit is required' }).min(1, { message: 'limit must be greater than 0' }).max(100, { message: 'limit must be less than 100' });

// export const PeriodValidation = z.enum(['ONE_DAY', 'TWO_DAY', 'WEEK', 'MONTH', 'YEAR'], { message: 'period is required' });

// export const PacketIdValidation = z.string({ message: 'packet id is required' }).min(25, { message: 'packet id must be between 25 and 35 characters long' }).max(35, { message: 'packet id must be between 25 and 35 characters long' });

// export const SharingTypeValidation = z.enum(['downloadFile', 'mailFile', 'json'], { message: 'sharing type is required' });