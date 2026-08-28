import { metrics } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

const otlpEndpoint = (
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'
).replace(/\/$/, '');
const serviceName = process.env.OTEL_SERVICE_NAME || 'api-service';

const resource = new Resource({
    'service.name': serviceName,
});

const meterProvider = new MeterProvider({
    resource,
    readers: [
        new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
                url: `${otlpEndpoint}/v1/metrics`,
            }),
            exportIntervalMillis: 15000,
        }),
    ],
});
metrics.setGlobalMeterProvider(meterProvider);

const loggerProvider = new LoggerProvider({ resource });
loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(
        new OTLPLogExporter({
            url: `${otlpEndpoint}/v1/logs`,
        }),
    ),
);
logs.setGlobalLoggerProvider(loggerProvider);

export const meter = metrics.getMeter(serviceName);
export const logger = logs.getLogger(serviceName);
export { SeverityNumber };
