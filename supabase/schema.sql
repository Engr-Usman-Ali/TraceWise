
-- ============================================================
-- TraceWise: Impact Reports Migration
-- Adds the tables required by the Impact Reports backend.
-- Preserves existing TraceWise data.
-- ============================================================

-- 1. Impact reports
CREATE TABLE IF NOT EXISTS public.impact_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id) ON DELETE CASCADE,

    source_document_id UUID
        REFERENCES public.documents(id) ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'pending',
    summary TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Individual impacts belonging to a report
CREATE TABLE IF NOT EXISTS public.impact_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    impact_report_id UUID NOT NULL
        REFERENCES public.impact_reports(id) ON DELETE CASCADE,

    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_impact_reports_company
    ON public.impact_reports(company_id);

CREATE INDEX IF NOT EXISTS idx_impact_reports_created_at
    ON public.impact_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_impact_reports_source_document
    ON public.impact_reports(source_document_id);

CREATE INDEX IF NOT EXISTS idx_impact_items_report
    ON public.impact_items(impact_report_id);

CREATE INDEX IF NOT EXISTS idx_impact_items_priority
    ON public.impact_items(priority);

CREATE INDEX IF NOT EXISTS idx_impact_items_status
    ON public.impact_items(status);

-- 4. Enable Row Level Security
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_items ENABLE ROW LEVEL SECURITY;

-- 5. Remove these policies first so this migration can be rerun
DROP POLICY IF EXISTS "impact_reports_select"
    ON public.impact_reports;

DROP POLICY IF EXISTS "impact_reports_insert"
    ON public.impact_reports;

DROP POLICY IF EXISTS "impact_reports_update"
    ON public.impact_reports;

DROP POLICY IF EXISTS "impact_reports_delete"
    ON public.impact_reports;

DROP POLICY IF EXISTS "impact_items_select"
    ON public.impact_items;

DROP POLICY IF EXISTS "impact_items_insert"
    ON public.impact_items;

DROP POLICY IF EXISTS "impact_items_update"
    ON public.impact_items;

DROP POLICY IF EXISTS "impact_items_delete"
    ON public.impact_items;

-- 6. Impact report policies
CREATE POLICY "impact_reports_select"
ON public.impact_reports
FOR SELECT
USING (
    company_id = (SELECT public.my_company_id())
);

CREATE POLICY "impact_reports_insert"
ON public.impact_reports
FOR INSERT
WITH CHECK (
    company_id = (SELECT public.my_company_id())
);

CREATE POLICY "impact_reports_update"
ON public.impact_reports
FOR UPDATE
USING (
    company_id = (SELECT public.my_company_id())
)
WITH CHECK (
    company_id = (SELECT public.my_company_id())
);

CREATE POLICY "impact_reports_delete"
ON public.impact_reports
FOR DELETE
USING (
    company_id = (SELECT public.my_company_id())
    AND (SELECT public.my_role()) = 'owner'
);

-- 7. Impact item policies
-- Each item inherits its company access from its parent report.

CREATE POLICY "impact_items_select"
ON public.impact_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.impact_reports r
        WHERE r.id = impact_items.impact_report_id
          AND r.company_id = (SELECT public.my_company_id())
    )
);

CREATE POLICY "impact_items_insert"
ON public.impact_items
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.impact_reports r
        WHERE r.id = impact_items.impact_report_id
          AND r.company_id = (SELECT public.my_company_id())
    )
);

CREATE POLICY "impact_items_update"
ON public.impact_items
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.impact_reports r
        WHERE r.id = impact_items.impact_report_id
          AND r.company_id = (SELECT public.my_company_id())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.impact_reports r
        WHERE r.id = impact_items.impact_report_id
          AND r.company_id = (SELECT public.my_company_id())
    )
);

CREATE POLICY "impact_items_delete"
ON public.impact_items
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.impact_reports r
        WHERE r.id = impact_items.impact_report_id
          AND r.company_id = (SELECT public.my_company_id())
          AND (SELECT public.my_role()) = 'owner'
    )
);

-- 8. Refresh the Supabase API schema cache
NOTIFY pgrst, 'reload schema';
