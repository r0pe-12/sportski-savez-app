type Payload = Record<string, unknown> | null | undefined;

export function AuditPayloadViewer({ payload }: { payload: Payload }) {
    if (!payload) {
        return <p className="text-sm text-muted-foreground">Bez payload-a.</p>;
    }

    return (
        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
            {JSON.stringify(payload, null, 2)}
        </pre>
    );
}
