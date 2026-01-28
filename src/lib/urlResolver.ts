import type { ServiceDefinition, ColumnDefinition, Environment } from '../types/schema';

/**
 * Resolves the final URL for a given service, column, and environment.
 * Handles variable substitution ({{var}}) and overrides.
 */
export function resolveUrl(
    service: ServiceDefinition,
    column: ColumnDefinition,
    env: Environment,
    globalVars: Record<string, string> = {}
): string | null {
    // 1. Check for explicit overrides first
    if (service.overrides && service.overrides[column.id]) {
        // We still might need to support variables in overrides? 
        // Usually overrides are absolute, but let's support substitutions just in case.
        return substituteVariables(service.overrides[column.id], service, env, globalVars);
    }

    // 2. If no override, use the column template
    if (!column.template) {
        return null;
    }

    return substituteVariables(column.template, service, env, globalVars);
}

function substituteVariables(
    template: string,
    service: ServiceDefinition,
    env: Environment,
    globalVars: Record<string, string>
): string {
    let result = template;

    // Standard variables
    const vars: Record<string, string> = {
        ...globalVars,
        service_id: service.id,
        service_name: service.name,
        env: env,
        ...service.variables // Merge service-specific variables
    };

    // Replace {{key}}
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
}
