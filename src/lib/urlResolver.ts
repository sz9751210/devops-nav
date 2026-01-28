import type { ServiceDefinition, ServiceLink, ColumnDefinition, Environment } from '../types/schema';

/**
 * Get visible links for a service based on current environment.
 */
export function getVisibleLinks(
    links: ServiceLink[] | undefined,
    env: Environment
): ServiceLink[] {
    if (!links) return [];
    return links.filter(link => {
        if (!link.environments || link.environments.length === 0) return true;
        return link.environments.includes(env);
    });
}

/**
 * Get visible links for a service, grouped by column.
 */
export function getLinksByColumn(
    links: ServiceLink[] | undefined,
    columns: ColumnDefinition[],
    env: Environment
): Map<string, ServiceLink[]> {
    const result = new Map<string, ServiceLink[]>();
    const visible = getVisibleLinks(links, env);

    columns.forEach(col => {
        const colLinks = visible.filter(l => l.columnId === col.id);
        if (colLinks.length > 0) {
            result.set(col.id, colLinks);
        }
    });

    return result;
}

/**
 * Substitute variables in a URL template (legacy support).
 */
export function substituteVariables(
    template: string,
    service: ServiceDefinition,
    env: Environment,
    globalVars: Record<string, string> = {}
): string {
    let result = template;

    const vars: Record<string, string> = {
        ...globalVars,
        service_id: service.id,
        service_name: service.name,
        env: env,
        ...service.variables
    };

    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
}
