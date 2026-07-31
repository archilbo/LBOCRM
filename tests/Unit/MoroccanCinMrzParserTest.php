<?php

namespace Tests\Unit;

use App\Services\Cin\MoroccanCinMrzParser;
use Tests\TestCase;

final class MoroccanCinMrzParserTest extends TestCase
{
    private MoroccanCinMrzParser $parser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->parser = new MoroccanCinMrzParser();
    }

    public function test_parse_valid_td1_mrz(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertTrue($result['detected']);
        $this->assertEquals('MAR', $result['issuingCountry']);
        $this->assertEquals('123456789', $result['documentNumber']);
        $this->assertEquals('SURNAME', $result['lastName']);
        $this->assertEquals('GIVEN', $result['firstName']);
    }

    public function test_parse_with_padding(): void
    {
        $lines = [
            'IDMAR123456789',
            '8001015M3001017MAR',
            'SURNAME<<GIVEN',
        ];

        $result = $this->parser->parse($lines);

        $this->assertTrue($result['detected']);
        $this->assertEquals('MAR', $result['issuingCountry']);
    }

    public function test_parse_with_extra_fillers(): void
        {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertTrue($result['detected']);
    }

    public function test_parse_invalid_with_wrong_number_of_lines(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
        ];

        $result = $this->parser->parse($lines);

        $this->assertFalse($result['valid']);
        $this->assertContains('mrz_requires_three_lines', $result['warnings']);
    }

    public function test_parse_invalid_with_line_too_long(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<EXTRA',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertFalse($result['valid']);
        $this->assertContains('mrz_line_length_invalid', $result['warnings']);
    }

    public function test_check_digit_calculation(): void
    {
        $this->assertEquals('9', $this->parser->checkDigit('IDMAR123456789'));
    }

    public function test_check_digit_with_letters(): void
    {
        $this->assertEquals('1', $this->parser->checkDigit('ABC123'));
    }

    public function test_parse_names_with_double_separator(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'DOESURNAME<<GIVENNAME<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertEquals('DOESURNAME', $result['lastName']);
        $this->assertEquals('GIVENNAME', $result['firstName']);
    }

    public function test_parse_date_valid(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertNotNull($result['birthDate']);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $result['birthDate']);
    }

    public function test_parse_date_invalid(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '9913015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertNull($result['birthDate']);
        $this->assertContains('mrz_birth_date_invalid', $result['warnings']);
    }

    public function test_issuing_country_not_mar(): void
    {
        $lines = [
            'IDFRA123456789<<<<<<<<<<<<<<<',
            '8001015M3001017MAR<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertContains('issuing_country_is_not_mar', $result['warnings']);
    }

    public function test_nationality_not_mar(): void
    {
        $lines = [
            'IDMAR123456789<<<<<<<<<<<<<<<',
            '8001015M3001017FRA<<<<<<<<<<<4',
            'SURNAME<<GIVEN<<<<<<<<<<<<<<<<<',
        ];

        $result = $this->parser->parse($lines);

        $this->assertContains('nationality_is_not_mar', $result['warnings']);
    }
}
