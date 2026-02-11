import React from 'react';
import { useNavigationStore } from '../../store/useMatrixStore';
import { EnvironmentPicker } from '../common/EnvironmentPicker';

export const EnvSelector: React.FC = () => {
    const { currentEnv, setEnv } = useNavigationStore();

    return (
        <EnvironmentPicker
            selected={currentEnv}
            onSelect={(env) => setEnv(env as string)}
            multi={false}
            variant="global"
        />
    );
};

