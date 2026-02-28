import supabase from '@/utils/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import React, { useEffect } from 'react';
import { history, useIntl } from 'umi';

const Authentication = () => {
  const intl = useIntl();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          history.push('/home');
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <div style={{ width: '40vw', minWidth: 300 }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github']}
          localization={{
            variables: {
              sign_in: {
                email_label: intl.formatMessage({ id: 'app.auth.email' }),
                password_label: intl.formatMessage({ id: 'app.auth.password' }),
                button_label: intl.formatMessage({ id: 'app.auth.signIn' }),
                loading_button_label: intl.formatMessage({
                  id: 'app.auth.signingIn',
                }),
                social_provider_text: intl.formatMessage({
                  id: 'app.auth.socialProvider',
                }),
                link_text: intl.formatMessage({
                  id: 'app.auth.alreadyHaveAccount',
                }),
              },
              sign_up: {
                email_label: intl.formatMessage({ id: 'app.auth.email' }),
                password_label: intl.formatMessage({
                  id: 'app.auth.createPassword',
                }),
                button_label: intl.formatMessage({ id: 'app.auth.signUp' }),
                loading_button_label: intl.formatMessage({
                  id: 'app.auth.signingUp',
                }),
                social_provider_text: intl.formatMessage({
                  id: 'app.auth.socialProviderSignUp',
                }),
                link_text: intl.formatMessage({ id: 'app.auth.noAccount' }),
              },
              forgotten_password: {
                email_label: intl.formatMessage({ id: 'app.auth.email' }),
                password_label: intl.formatMessage({ id: 'app.auth.password' }),
                button_label: intl.formatMessage({
                  id: 'app.auth.sendResetLink',
                }),
                loading_button_label: intl.formatMessage({
                  id: 'app.auth.sendingResetLink',
                }),
                link_text: intl.formatMessage({
                  id: 'app.auth.forgotPassword',
                }),
              },
              update_password: {
                password_label: intl.formatMessage({
                  id: 'app.auth.newPassword',
                }),
                button_label: intl.formatMessage({
                  id: 'app.auth.updatePassword',
                }),
                loading_button_label: intl.formatMessage({
                  id: 'app.auth.updatingPassword',
                }),
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(Authentication);
