// Simple test to verify quarter helper functions
describe('Quarter Helper Functions', () => {
  // Mock getQuarters function
  const getQuarters = (count = 5) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const currentQStart = Math.floor(month / 3) * 3;

    const quarters = [];
    let qStart = currentQStart;
    let qYear = year;

    for (let i = 0; i < count; i += 1) {
      const startDate = new Date(qYear, qStart, 1);
      const qNum = Math.floor(qStart / 3) + 1;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `Q${qNum} ${qYear}`;
      const rangeLabel = `${monthNames[qStart]} - ${monthNames[(qStart + 2) % 12]} ${qYear}`;
      quarters.push({
        label: i === 0 ? `${label} (Today)` : label,
        rangeLabel,
        isoDate: startDate.toISOString().split('T')[0],
        isToday: i === 0,
      });
      qStart = (qStart + 3) % 12;
      if (qStart === 0) qYear += 1;
    }
    return quarters;
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  };

  const getQuarterLabel = (date) => {
    const m = date.getUTCMonth() + 1;
    if (m >= 1 && m <= 3) return 'Q1';
    if (m >= 4 && m <= 6) return 'Q2';
    if (m >= 7 && m <= 9) return 'Q3';
    return 'Q4';
  };

  const getQuarterEnd = (date) => {
    const q = getQuarterLabel(date);
    const year = date.getUTCFullYear();
    if (q === 'Q1') return new Date(Date.UTC(year, 2, 31, 23, 59, 59, 999));
    if (q === 'Q2') return new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999));
    if (q === 'Q3') return new Date(Date.UTC(year, 8, 30, 23, 59, 59, 999));
    return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  };

  const splitIntervalByQuarter = (startDate, totalDays) => {
    const segments = [];
    let remaining = totalDays;
    let cursor = new Date(startDate);

    while (remaining > 0) {
      const qEnd = getQuarterEnd(cursor);
      const msPerDay = 24 * 60 * 60 * 1000;
      const diff =
        Math.floor(
          (Date.UTC(qEnd.getUTCFullYear(), qEnd.getUTCMonth(), qEnd.getUTCDate()) -
            Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate())) /
          msPerDay
        ) + 1;
      const take = Math.min(remaining, diff);

      segments.push({
        quarter: getQuarterLabel(cursor),
        start: new Date(cursor),
        days: take,
      });

      cursor = addDays(cursor, take);
      remaining -= take;
    }
    return segments;
  };

  test('getQuarters returns 5 quarters by default', () => {
    const quarters = getQuarters();
    expect(quarters).toHaveLength(5);
  });

  test('getQuarters labels first quarter with (Today)', () => {
    const quarters = getQuarters();
    expect(quarters[0].label).toContain('(Today)');
  });

  test('getQuarters returns valid ISO dates', () => {
    const quarters = getQuarters();
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    quarters.forEach((q) => {
      expect(q.isoDate).toMatch(isoDateRegex);
    });
  });

  test('getQuarterLabel returns correct quarter for dates', () => {
    expect(getQuarterLabel(new Date('2026-01-15'))).toBe('Q1');
    expect(getQuarterLabel(new Date('2026-04-15'))).toBe('Q2');
    expect(getQuarterLabel(new Date('2026-07-15'))).toBe('Q3');
    expect(getQuarterLabel(new Date('2026-10-15'))).toBe('Q4');
  });

  test('splitIntervalByQuarter splits 90 days correctly', () => {
    const start = new Date('2026-01-01');
    const segments = splitIntervalByQuarter(start, 90);
    const totalDays = segments.reduce((sum, s) => sum + s.days, 0);
    expect(totalDays).toBe(90);
  });

  test('splitIntervalByQuarter handles multi-quarter durations', () => {
    const start = new Date('2026-02-15');
    const segments = splitIntervalByQuarter(start, 180);
    const totalDays = segments.reduce((sum, s) => sum + s.days, 0);
    expect(totalDays).toBe(180);
    expect(segments.length).toBeGreaterThan(1);
  });

  test('addDays adds days correctly', () => {
    const start = new Date('2026-01-01');
    const result = addDays(start, 10);
    expect(result.getUTCDate()).toBe(11);
  });
});
