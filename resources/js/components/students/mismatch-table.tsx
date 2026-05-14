type Mismatch = { local: string; remote: string };
type Mismatches = Record<string, Mismatch>;

const labels: Record<string, string> = {
    ime: 'Ime',
    prezime: 'Prezime',
    razred: 'Razred',
    sifra_skole: 'Šifra škole',
};

export function MismatchTable({ mismatches }: { mismatches: Mismatches }) {
    const safeMismatches = mismatches ?? {};
    const keys = Object.keys(safeMismatches);

    if (keys.length === 0) {
        return null;
    }

    return (
        <div className="rounded border">
            <table className="w-full text-sm">
                <thead className="bg-muted">
                    <tr>
                        <th className="p-2 text-left">Polje</th>
                        <th className="p-2 text-left">Lokalno</th>
                        <th className="p-2 text-left">eDnevnik</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map((key) => (
                        <tr key={key} className="border-t">
                            <td className="p-2 font-medium">{labels[key] ?? key}</td>
                            <td className="p-2">{safeMismatches[key].local}</td>
                            <td className="p-2 text-amber-700">{safeMismatches[key].remote}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
