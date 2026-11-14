-- =====================================================================
-- Online Course Platform - PostgreSQL schema (chạy trong DBeaver)
-- Schema: public | Không DROP | An toàn khi chạy lại (idempotent)
-- Yêu cầu: PostgreSQL 13+ (gen_random_uuid() có sẵn)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'user_role' AND n.nspname = 'public') THEN
        CREATE TYPE public.user_role AS ENUM ('STUDENT', 'TEACHER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'enrollment_status' AND n.nspname = 'public') THEN
        CREATE TYPE public.enrollment_status AS ENUM ('ON_GOING', 'COMPLETED');
    END IF;
END
$$;

-- ---------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    role          public.user_role DEFAULT 'STUDENT',
    job_title     VARCHAR(150),
    bio           TEXT,
    location      VARCHAR(100),
    created_at    TIMESTAMPTZ  DEFAULT now(),
    updated_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    icon_url   TEXT,
    created_at TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.topics (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    category_id UUID         NOT NULL,
    CONSTRAINT fk_topics_category
        FOREIGN KEY (category_id) REFERENCES public.categories (id)
);

CREATE TABLE IF NOT EXISTS public.courses (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    thumbnail_url  TEXT,
    teacher_id     UUID         NOT NULL,
    category_id    UUID         NOT NULL,
    price          DECIMAL      NOT NULL DEFAULT 0,
    discount_price DECIMAL,
    total_lessons  INTEGER      DEFAULT 0,
    benefits       JSONB,
    created_at     TIMESTAMPTZ  DEFAULT now(),
    updated_at     TIMESTAMPTZ  DEFAULT now(),
    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id)  REFERENCES public.users (id),
    CONSTRAINT fk_courses_category
        FOREIGN KEY (category_id) REFERENCES public.categories (id),
    CONSTRAINT chk_courses_price          CHECK (price >= 0),
    CONSTRAINT chk_courses_discount_price CHECK (discount_price IS NULL OR (discount_price >= 0 AND discount_price <= price)),
    CONSTRAINT chk_courses_total_lessons  CHECK (total_lessons IS NULL OR total_lessons >= 0)
);

CREATE TABLE IF NOT EXISTS public.sections (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID         NOT NULL,
    title       VARCHAR(255) NOT NULL,
    order_index INTEGER      NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT now(),
    CONSTRAINT fk_sections_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id),
    CONSTRAINT chk_sections_order_index CHECK (order_index >= 0)
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id       UUID         NOT NULL,
    title            VARCHAR(255) NOT NULL,
    video_url        TEXT,
    duration_minutes INTEGER,
    order_index      INTEGER      NOT NULL,
    created_at       TIMESTAMPTZ  DEFAULT now(),
    CONSTRAINT fk_lessons_section
        FOREIGN KEY (section_id) REFERENCES public.sections (id),
    CONSTRAINT chk_lessons_duration    CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
    CONSTRAINT chk_lessons_order_index CHECK (order_index >= 0)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID    NOT NULL,
    course_id           UUID    NOT NULL,
    progress_percentage DECIMAL DEFAULT 0,
    status              public.enrollment_status DEFAULT 'ON_GOING',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_enrollments_user
        FOREIGN KEY (user_id)   REFERENCES public.users (id),
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id),
    CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id),
    CONSTRAINT chk_enrollments_progress
        CHECK (progress_percentage IS NULL OR (progress_percentage >= 0 AND progress_percentage <= 100))
);

CREATE TABLE IF NOT EXISTS public.saved_courses (
    user_id    UUID NOT NULL,
    course_id  UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT pk_saved_courses PRIMARY KEY (user_id, course_id),
    CONSTRAINT fk_saved_courses_user
        FOREIGN KEY (user_id)   REFERENCES public.users (id),
    CONSTRAINT fk_saved_courses_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id  UUID    NOT NULL,
    user_id    UUID    NOT NULL,
    rating     INTEGER NOT NULL,
    comment    TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_reviews_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)   REFERENCES public.users (id),
    CONSTRAINT uq_reviews_course_user UNIQUE (course_id, user_id),
    CONSTRAINT chk_reviews_rating     CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS public.qna (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id  UUID NOT NULL,
    user_id    UUID NOT NULL,
    parent_id  UUID,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_qna_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id),
    CONSTRAINT fk_qna_user
        FOREIGN KEY (user_id)   REFERENCES public.users (id),
    CONSTRAINT fk_qna_parent
        FOREIGN KEY (parent_id) REFERENCES public.qna (id)
);

CREATE TABLE IF NOT EXISTS public.projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id     UUID NOT NULL,
    user_id       UUID NOT NULL,
    description   TEXT,
    thumbnail_url TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_projects_course
        FOREIGN KEY (course_id) REFERENCES public.courses (id),
    CONSTRAINT fk_projects_user
        FOREIGN KEY (user_id)   REFERENCES public.users (id)
);

CREATE TABLE IF NOT EXISTS public.project_resources (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID         NOT NULL,
    file_name  VARCHAR(255) NOT NULL,
    file_type  VARCHAR(50),
    file_size  INTEGER,
    file_url   TEXT         NOT NULL,
    created_at TIMESTAMPTZ  DEFAULT now(),
    CONSTRAINT fk_project_resources_project
        FOREIGN KEY (project_id) REFERENCES public.projects (id),
    CONSTRAINT chk_project_resources_file_size CHECK (file_size IS NULL OR file_size >= 0)
);

-- ---------------------------------------------------------------------
-- 3. INDEXES cho foreign key
--    (các cột đã đứng đầu UNIQUE/PK composite thì không cần tạo lại:
--     enrollments.user_id, saved_courses.user_id, reviews.course_id)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_topics_category_id            ON public.topics (category_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id            ON public.courses (teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id           ON public.courses (category_id);
CREATE INDEX IF NOT EXISTS idx_sections_course_id            ON public.sections (course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section_id            ON public.lessons (section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id         ON public.enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_saved_courses_course_id       ON public.saved_courses (course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id               ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_qna_course_id                 ON public.qna (course_id);
CREATE INDEX IF NOT EXISTS idx_qna_user_id                   ON public.qna (user_id);
CREATE INDEX IF NOT EXISTS idx_qna_parent_id                 ON public.qna (parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_course_id            ON public.projects (course_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id              ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_project_id  ON public.project_resources (project_id);

-- ---------------------------------------------------------------------
-- 4. TRIGGER tự cập nhật updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
