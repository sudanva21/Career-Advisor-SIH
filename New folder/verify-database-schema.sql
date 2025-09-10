-- ========================================================================
-- DATABASE SCHEMA VERIFICATION SCRIPT
-- ========================================================================
-- This script verifies that all required tables exist and are properly configured.
-- Run this after executing the complete-database-schema.sql script.

-- Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY[
        'profiles',
        'career_roadmaps', 
        'quiz_results',
        'colleges',
        'saved_colleges',
        'activities',
        'job_applications',
        'user_resumes',
        'job_matches', 
        'outreach_drafts',
        'user_achievements',
        'user_skills',
        'user_subscriptions',
        'payment_history'
    ];
    table_name TEXT;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'VERIFYING DATABASE SCHEMA...';
    RAISE NOTICE '========================================================================';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ Table ''%'' exists', table_name;
        ELSE
            RAISE NOTICE '❌ Table ''%'' MISSING', table_name;
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '========================================================================';
        RAISE NOTICE '⚠️  MISSING TABLES DETECTED: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE '========================================================================';
    ELSE
        RAISE NOTICE '========================================================================';
        RAISE NOTICE '✅ ALL REQUIRED TABLES ARE PRESENT!';
        RAISE NOTICE '========================================================================';
    END IF;
END
$$;

-- Verify RLS is enabled on user-specific tables
DO $$
DECLARE
    table_record RECORD;
    rls_tables TEXT[] := ARRAY[
        'profiles',
        'career_roadmaps', 
        'quiz_results',
        'saved_colleges',
        'activities',
        'job_applications',
        'user_resumes',
        'job_matches', 
        'outreach_drafts',
        'user_achievements',
        'user_skills',
        'user_subscriptions',
        'payment_history'
    ];
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFYING ROW LEVEL SECURITY (RLS)...';
    RAISE NOTICE '========================================================================';
    
    FOREACH table_name IN ARRAY rls_tables
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
        
        IF rls_enabled THEN
            RAISE NOTICE '✅ RLS enabled on ''%''', table_name;
        ELSE
            RAISE NOTICE '❌ RLS NOT enabled on ''%''', table_name;
        END IF;
    END LOOP;
END
$$;

-- Verify key indexes exist
DO $$
DECLARE
    index_exists BOOLEAN;
    key_indexes TEXT[] := ARRAY[
        'idx_career_roadmaps_user_id',
        'idx_quiz_results_user_id',
        'idx_activities_user_id',
        'idx_saved_colleges_user_id',
        'idx_job_applications_user_id',
        'idx_colleges_state'
    ];
    index_name TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFYING KEY INDEXES...';
    RAISE NOTICE '========================================================================';
    
    FOREACH index_name IN ARRAY key_indexes
    LOOP
        SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = index_name
        ) INTO index_exists;
        
        IF index_exists THEN
            RAISE NOTICE '✅ Index ''%'' exists', index_name;
        ELSE
            RAISE NOTICE '❌ Index ''%'' MISSING', index_name;
        END IF;
    END LOOP;
END
$$;

-- Verify foreign key relationships
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFYING FOREIGN KEY RELATIONSHIPS...';
    RAISE NOTICE '========================================================================';
    
    -- Check profiles -> auth.users relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu USING (constraint_schema, constraint_name)
    WHERE tc.table_name = 'profiles' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users';
    
    IF fk_count > 0 THEN
        RAISE NOTICE '✅ profiles -> auth.users relationship exists';
    ELSE
        RAISE NOTICE '❌ profiles -> auth.users relationship MISSING';
    END IF;
    
    -- Check career_roadmaps -> profiles relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu USING (constraint_schema, constraint_name)
    WHERE tc.table_name = 'career_roadmaps' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'profiles';
    
    IF fk_count > 0 THEN
        RAISE NOTICE '✅ career_roadmaps -> profiles relationship exists';
    ELSE
        RAISE NOTICE '❌ career_roadmaps -> profiles relationship MISSING';
    END IF;
    
    -- Check saved_colleges -> colleges relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu USING (constraint_schema, constraint_name)
    WHERE tc.table_name = 'saved_colleges' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'colleges';
    
    IF fk_count > 0 THEN
        RAISE NOTICE '✅ saved_colleges -> colleges relationship exists';
    ELSE
        RAISE NOTICE '❌ saved_colleges -> colleges relationship MISSING';
    END IF;
END
$$;

-- Check sample data
DO $$
DECLARE
    college_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFYING SAMPLE DATA...';
    RAISE NOTICE '========================================================================';
    
    SELECT COUNT(*) INTO college_count FROM public.colleges;
    
    IF college_count > 0 THEN
        RAISE NOTICE '✅ Sample college data exists (%s colleges)', college_count;
    ELSE
        RAISE NOTICE '❌ No sample college data found';
    END IF;
END
$$;

-- Test user profile creation function
DO $$
DECLARE
    function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'VERIFYING FUNCTIONS AND TRIGGERS...';
    RAISE NOTICE '========================================================================';
    
    SELECT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ handle_new_user() function exists';
    ELSE
        RAISE NOTICE '❌ handle_new_user() function MISSING';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'handle_updated_at'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ handle_updated_at() function exists';
    ELSE
        RAISE NOTICE '❌ handle_updated_at() function MISSING';
    END IF;
END
$$;

-- Summary with table counts
DO $$
DECLARE
    table_record RECORD;
    total_tables INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'TABLE SUMMARY...';
    RAISE NOTICE '========================================================================';
    
    FOR table_record IN 
        SELECT table_name, 
               (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
        FROM (
            SELECT table_name, 
                   query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', 
                                      table_schema, table_name), false, true, '') as xml_count
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE 'pg_%'
            ORDER BY table_name
        ) t
    LOOP
        RAISE NOTICE '📊 % : % rows', table_record.table_name, COALESCE(table_record.row_count, 0);
        total_tables := total_tables + 1;
    END LOOP;
    
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '📊 TOTAL TABLES: %', total_tables;
    RAISE NOTICE '========================================================================';
END
$$;

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 DATABASE SCHEMA VERIFICATION COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check for any ❌ errors above and fix them';
    RAISE NOTICE '2. Test your application APIs';
    RAISE NOTICE '3. Verify data can be inserted and retrieved';
    RAISE NOTICE '4. No more mock data should be needed!';
    RAISE NOTICE '========================================================================';
END
$$;