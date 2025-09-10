-- ========================================================================
-- SCHEMA FIX VERIFICATION TEST
-- ========================================================================
-- This script tests the common queries that were failing before the fix.
-- Run this AFTER applying the migration to ensure APIs will work.

-- Test 1: Verify career_roadmaps table structure
DO $$
DECLARE
    user_id_exists BOOLEAN;
    userid_exists BOOLEAN;
BEGIN
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '🧪 TESTING SCHEMA FIX VERIFICATION';
    RAISE NOTICE '========================================================================';
    
    -- Check if user_id column exists (should be TRUE)
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'career_roadmaps' 
        AND column_name = 'user_id'
    ) INTO user_id_exists;
    
    -- Check if userId column exists (should be FALSE)
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'career_roadmaps' 
        AND column_name = 'userId'
    ) INTO userid_exists;
    
    IF user_id_exists AND NOT userid_exists THEN
        RAISE NOTICE '✅ Test 1 PASSED: career_roadmaps.user_id exists, userId does not';
    ELSE
        RAISE NOTICE '❌ Test 1 FAILED: career_roadmaps column issue detected';
        IF NOT user_id_exists THEN
            RAISE NOTICE '   - Missing user_id column';
        END IF;
        IF userid_exists THEN
            RAISE NOTICE '   - Old userId column still exists';
        END IF;
    END IF;
END
$$;

-- Test 2: Simulate the dashboard API query that was failing
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- dummy UUID for testing
    query_success BOOLEAN := TRUE;
    error_msg TEXT;
BEGIN
    -- Test the exact query from dashboard API
    BEGIN
        PERFORM * FROM public.career_roadmaps 
        WHERE user_id = test_user_id 
        ORDER BY updated_at DESC 
        LIMIT 1;
        
        RAISE NOTICE '✅ Test 2 PASSED: Dashboard query (career_roadmaps.user_id) executes without error';
    EXCEPTION WHEN OTHERS THEN
        query_success := FALSE;
        error_msg := SQLERRM;
        RAISE NOTICE '❌ Test 2 FAILED: Dashboard query failed with error: %', error_msg;
    END;
END
$$;

-- Test 3: Test quiz results query (should work as it was already correct)
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM id, career_path, score, created_at 
        FROM public.quiz_results 
        WHERE user_id = test_user_id;
        
        RAISE NOTICE '✅ Test 3 PASSED: Quiz results query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 3 FAILED: Quiz results query error: %', SQLERRM;
    END;
END
$$;

-- Test 4: Test activities query
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM * FROM public.activities 
        WHERE user_id = test_user_id 
        ORDER BY created_at DESC 
        LIMIT 20;
        
        RAISE NOTICE '✅ Test 4 PASSED: Activities query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 4 FAILED: Activities query error: %', SQLERRM;
    END;
END
$$;

-- Test 5: Test user_activities query (legacy table)
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM * FROM public.user_activities 
        WHERE user_id = test_user_id 
        ORDER BY created_at DESC 
        LIMIT 20;
        
        RAISE NOTICE '✅ Test 5 PASSED: User activities query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 5 FAILED: User activities query error: %', SQLERRM;
    END;
END
$$;

-- Test 6: Test saved colleges query
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM id, college_name, college_location, college_type, created_at 
        FROM public.saved_colleges 
        WHERE user_id = test_user_id;
        
        RAISE NOTICE '✅ Test 6 PASSED: Saved colleges query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 6 FAILED: Saved colleges query error: %', SQLERRM;
    END;
END
$$;

-- Test 7: Test user skills query  
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM * FROM public.user_skills 
        WHERE user_id = test_user_id 
        ORDER BY last_updated DESC;
        
        RAISE NOTICE '✅ Test 7 PASSED: User skills query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 7 FAILED: User skills query error: %', SQLERRM;
    END;
END
$$;

-- Test 8: Test user achievements query
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    BEGIN
        PERFORM * FROM public.user_achievements 
        WHERE user_id = test_user_id 
        ORDER BY unlocked_at DESC;
        
        RAISE NOTICE '✅ Test 8 PASSED: User achievements query (user_id) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Test 8 FAILED: User achievements query error: %', SQLERRM;
    END;
END
$$;

-- Test 9: Test RLS policy works correctly
DO $$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    -- Check if RLS policies reference user_id correctly
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'career_roadmaps'
        AND policyname LIKE '%own%'
        AND definition LIKE '%user_id%'
    ) INTO policy_exists;
    
    IF policy_exists THEN
        RAISE NOTICE '✅ Test 9 PASSED: RLS policies reference user_id correctly';
    ELSE
        RAISE NOTICE '❌ Test 9 FAILED: RLS policies may still reference old column names';
    END IF;
END
$$;

-- Test 10: Test that indexes exist on user_id columns
DO $$
DECLARE
    roadmap_index_exists BOOLEAN;
    quiz_index_exists BOOLEAN;
    activities_index_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'career_roadmaps'
        AND indexname = 'idx_career_roadmaps_user_id'
    ) INTO roadmap_index_exists;
    
    SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'quiz_results'
        AND indexname = 'idx_quiz_results_user_id'
    ) INTO quiz_index_exists;
    
    SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'activities'
        AND indexname = 'idx_activities_user_id'
    ) INTO activities_index_exists;
    
    IF roadmap_index_exists AND quiz_index_exists AND activities_index_exists THEN
        RAISE NOTICE '✅ Test 10 PASSED: Key user_id indexes exist for performance';
    ELSE
        RAISE NOTICE '⚠️  Test 10 PARTIAL: Some user_id indexes may be missing';
        IF NOT roadmap_index_exists THEN
            RAISE NOTICE '   - Missing idx_career_roadmaps_user_id';
        END IF;
        IF NOT quiz_index_exists THEN
            RAISE NOTICE '   - Missing idx_quiz_results_user_id';
        END IF;
        IF NOT activities_index_exists THEN
            RAISE NOTICE '   - Missing idx_activities_user_id';
        END IF;
    END IF;
END
$$;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '🎯 SCHEMA FIX VERIFICATION COMPLETED';
    RAISE NOTICE '';
    RAISE NOTICE '📋 What was tested:';
    RAISE NOTICE '• Column naming consistency (user_id vs userId)';
    RAISE NOTICE '• Dashboard API queries (career_roadmaps, activities, etc.)';
    RAISE NOTICE '• Quiz and college-related queries';
    RAISE NOTICE '• RLS policies reference correct columns';
    RAISE NOTICE '• Performance indexes on user_id columns';
    RAISE NOTICE '';
    RAISE NOTICE '✅ If all tests passed above, your APIs should work without errors!';
    RAISE NOTICE '❌ If any tests failed, review the migration script and re-run.';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next: Test your actual API endpoints:';
    RAISE NOTICE '   • GET /api/dashboard';
    RAISE NOTICE '   • GET /api/roadmap/list';
    RAISE NOTICE '   • GET /api/quiz/past-results';
    RAISE NOTICE '   • GET /api/colleges';
    RAISE NOTICE '========================================================================';
END
$$;