
-- TraceWise: Review Tasks
-- Adds task tracking, comments, and audit history.

CREATE TABLE IF NOT EXISTS public.review_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,

    impact_report_id UUID
        REFERENCES public.impact_reports(id) ON DELETE SET NULL,

    document_id UUID
        REFERENCES public.documents(id) ON DELETE SET NULL,

    assigned_to UUID
        REFERENCES public.profiles(id) ON DELETE SET NULL,

    created_by UUID
        REFERENCES public.profiles(id) ON DELETE SET NULL,

    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    status TEXT NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'in_progress',
                'blocked',
                'completed',
                'cancelled'
            )
        ),

    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.review_task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id) ON DELETE CASCADE,

    task_id UUID NOT NULL
        REFERENCES public.review_tasks(id) ON DELETE CASCADE,

    author_id UUID
        REFERENCES public.profiles(id) ON DELETE SET NULL,

    comment TEXT NOT NULL
        CHECK (char_length(trim(comment)) BETWEEN 1 AND 2000),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES public.companies(id) ON DELETE CASCADE,

    actor_id UUID
        REFERENCES public.profiles(id) ON DELETE SET NULL,

    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_tasks_company
    ON public.review_tasks(company_id);

CREATE INDEX IF NOT EXISTS idx_review_tasks_status
    ON public.review_tasks(company_id, status);

CREATE INDEX IF NOT EXISTS idx_review_tasks_assignee
    ON public.review_tasks(company_id, assigned_to);

CREATE INDEX IF NOT EXISTS idx_review_tasks_due_date
    ON public.review_tasks(company_id, due_date);

CREATE INDEX IF NOT EXISTS idx_review_task_comments_task
    ON public.review_task_comments(task_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity
    ON public.audit_events(company_id, entity_type, entity_id, created_at);

ALTER TABLE public.review_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- The FastAPI service uses its configured Supabase client.
-- These policies also restrict direct authenticated access by company.

DROP POLICY IF EXISTS review_tasks_select ON public.review_tasks;
DROP POLICY IF EXISTS review_tasks_insert ON public.review_tasks;
DROP POLICY IF EXISTS review_tasks_update ON public.review_tasks;
DROP POLICY IF EXISTS review_tasks_delete ON public.review_tasks;

CREATE POLICY review_tasks_select
ON public.review_tasks FOR SELECT
USING (company_id = (SELECT public.my_company_id()));

CREATE POLICY review_tasks_insert
ON public.review_tasks FOR INSERT
WITH CHECK (company_id = (SELECT public.my_company_id()));

CREATE POLICY review_tasks_update
ON public.review_tasks FOR UPDATE
USING (company_id = (SELECT public.my_company_id()))
WITH CHECK (company_id = (SELECT public.my_company_id()));

CREATE POLICY review_tasks_delete
ON public.review_tasks FOR DELETE
USING (
    company_id = (SELECT public.my_company_id())
    AND (SELECT public.my_role()) = 'owner'
);

DROP POLICY IF EXISTS review_task_comments_select
    ON public.review_task_comments;
DROP POLICY IF EXISTS review_task_comments_insert
    ON public.review_task_comments;
DROP POLICY IF EXISTS audit_events_select
    ON public.audit_events;
DROP POLICY IF EXISTS audit_events_insert
    ON public.audit_events;

CREATE POLICY review_task_comments_select
ON public.review_task_comments FOR SELECT
USING (company_id = (SELECT public.my_company_id()));

CREATE POLICY review_task_comments_insert
ON public.review_task_comments FOR INSERT
WITH CHECK (
    company_id = (SELECT public.my_company_id())
    AND author_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.review_tasks t
        WHERE t.id = task_id
          AND t.company_id = (SELECT public.my_company_id())
    )
);

CREATE POLICY audit_events_select
ON public.audit_events FOR SELECT
USING (company_id = (SELECT public.my_company_id()));

CREATE POLICY audit_events_insert
ON public.audit_events FOR INSERT
WITH CHECK (
    company_id = (SELECT public.my_company_id())
    AND actor_id = auth.uid()
);

NOTIFY pgrst, 'reload schema';
