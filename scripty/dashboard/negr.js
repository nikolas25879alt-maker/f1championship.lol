// supabase-auth.js
(function() {
    // ===== Supabase configuration =====
    const SUPABASE_URL = "https://zjtkdztrwqrjqquygtbr.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdGtkenRyd3FyanFxdXlndGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTE2NDEsImV4cCI6MjA5ODM4NzY0MX0.t8eT3QHOPY50dL_oIpJrXTxQHMJi6rCjUU-f3OmLJxI";

    // Hardcoded admin fallback (same as used in the dashboard)
    const ADMIN_USERS = [
        'fb0addca-1742-4fc3-9ff8-a2eb43ab66e7',
    ];

    let sbClient = null;
    let currentUser = null;

    // ===== Internal: get or create Supabase client =====
    function getClient() {
        if (!sbClient) {
            if (typeof window.supabase !== 'undefined') {
                sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            } else {
                console.error('supabase-auth: Supabase library not loaded.');
                return null;
            }
        }
        return sbClient;
    }

    // ===== VIP check (includes admin bypass) =====
    async function isVip(userId) {
        try {
            const client = getClient();
            if (!client) return false;

            // 1. Check if user is an admin → they are considered VIP
            const { data: adminData, error: adminError } = await client
                .from('admins')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();
            if (adminData) return true;

            // 2. Check vip_users table
            const { data, error } = await client
                .from('vip_users')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();
            if (error && error.code !== 'PGRST116') throw error;  // ignore "not found"
            return !!data;
        } catch (err) {
            console.warn('supabase-auth: VIP check error:', err);
            return false;
        }
    }

    // ===== Admin check (database first, then hardcoded fallback) =====
    async function isAdmin(userId) {
        try {
            const client = getClient();
            if (!client) return false;

            const { data, error } = await client
                .from('admins')
                .select('user_id')
                .eq('user_id', userId)
                .maybeSingle();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) return true;

            // Fallback to hardcoded list
            return ADMIN_USERS.includes(userId);
        } catch (err) {
            console.warn('supabase-auth: Admin check error:', err);
            return ADMIN_USERS.includes(userId);
        }
    }

    // ===== Get the current session =====
    async function getSession() {
        const client = getClient();
        if (!client) return null;
        const { data: { session }, error } = await client.auth.getSession();
        if (error) {
            console.warn('supabase-auth: Session error:', error);
            return null;
        }
        return session;
    }

    // ===== Get the current user (cached) =====
    async function getCurrentUser() {
        if (currentUser) return currentUser;
        const session = await getSession();
        if (session) {
            currentUser = session.user;
            return currentUser;
        }
        return null;
    }

    // ===== Expose public API =====
    window.SupabaseAuth = {
        isVip,
        isAdmin,
        getCurrentUser,
        getSession,
        ADMIN_USERS
    };
})();