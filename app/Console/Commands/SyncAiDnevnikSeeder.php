<?php

namespace App\Console\Commands;

use App\Models\AiDnevnikSesija;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('ai-dnevnik:sync-seeder')]
#[Description('Regeneriše database/seeders/AiDnevnikSeeder.php iz trenutnog stanja ai_dnevnik_sesije tabele. Pokreni nakon svake INSERT/UPDATE sesije.')]
class SyncAiDnevnikSeeder extends Command
{
    private const LONG_FIELDS = ['cilj', 'instrukcije', 'output', 'odluke', 'ishod'];

    public function handle(): int
    {
        $sesije = AiDnevnikSesija::orderBy('broj')->get();

        if ($sesije->isEmpty()) {
            $this->error('Nema sesija u bazi. Skip.');

            return self::FAILURE;
        }

        $entries = $sesije->map(fn (AiDnevnikSesija $s) => $this->entryFor($s))->implode("\n");

        $seeder = $this->seederTemplate($entries);

        $path = base_path('database/seeders/AiDnevnikSeeder.php');
        file_put_contents($path, $seeder);

        $this->info("Seeder regenerated. Sessions exported: {$sesije->count()}");
        $this->info('File size: '.number_format(filesize($path)).' bytes');

        return self::SUCCESS;
    }

    private function entryFor(AiDnevnikSesija $s): string
    {
        $lines = [];
        $lines[] = '            [';
        $lines[] = "                'broj' => {$s->broj},";
        $lines[] = "                'naslov' => ".$this->phpString($s->naslov).',';
        $lines[] = "                'datum' => ".$this->phpString($s->datum->format('Y-m-d')).',';
        $lines[] = "                'faza' => ".$this->phpString($s->faza).',';
        $lines[] = "                'alat' => ".$this->phpString($s->alat).',';

        foreach (self::LONG_FIELDS as $field) {
            $value = (string) ($s->{$field} ?? '');

            if ($this->shouldUseHeredoc($value)) {
                $marker = strtoupper($field).'_'.$s->broj;
                $lines[] = "                '{$field}' => <<<'{$marker}'";
                foreach (explode("\n", $value) as $line) {
                    $lines[] = $line;
                }
                $lines[] = $marker.',';
            } else {
                $lines[] = "                '{$field}' => ".$this->phpString($value).',';
            }
        }

        $lines[] = '            ],';

        return implode("\n", $lines);
    }

    private function shouldUseHeredoc(string $value): bool
    {
        return str_contains($value, "\n")
            || str_contains($value, '###')
            || str_contains($value, '**')
            || str_contains($value, '`')
            || strlen($value) > 200;
    }

    private function phpString(string $s): string
    {
        if (! str_contains($s, "'") && ! str_contains($s, '\\')) {
            return "'".$s."'";
        }

        return '"'.addcslashes($s, "\"\\\n\r\t\$").'"';
    }

    private function seederTemplate(string $body): string
    {
        return <<<PHP
<?php

namespace Database\Seeders;

use App\Models\AiDnevnikSesija;
use Illuminate\Database\Seeder;

class AiDnevnikSeeder extends Seeder
{
    /**
     * Seeder za AI dnevnik sesije.
     *
     * Auto-generisan iz tabele ai_dnevnik_sesije kroz `php artisan ai-dnevnik:sync-seeder`.
     * Vidjeti CLAUDE.md sekcija 2.2 — workflow: INSERT/UPDATE u bazu, pa sync-seeder, pa commit.
     *
     * Idempotency: updateOrCreate po koloni broj — bezbjedno za re-run.
     */
    public function run(): void
    {
        \$sesije = [
{$body}
        ];

        foreach (\$sesije as \$sesija) {
            AiDnevnikSesija::updateOrCreate(
                ['broj' => \$sesija['broj']],
                \$sesija
            );
        }
    }
}

PHP;
    }
}
