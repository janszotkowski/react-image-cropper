import { Github, Linkedin } from 'lucide-react';
import * as React from 'react';

const SOCIALS: { href: string; icon: React.ElementType; }[] = [
    {
        href: 'https://github.com/janszotkowski',
        icon: Github,
    },
    {
        href: 'https://www.linkedin.com/in/jan-szotkowski-089295159/',
        icon: Linkedin,
    },
] as const;

export const Socials = (): React.ReactElement => (
    <div className={'flex absolute bottom-4 right-4 bg-black/50 rounded-full'}>
        {SOCIALS.map((social) => (
            <a
                key={social.href}
                href={social.href}
                target={'_blank'}
                rel={'noreferrer'}
                className={'rounded-full p-2 hover:bg-white/10 transition-colors'}
            >
                <social.icon
                    size={20}
                    strokeWidth={1}
                />
            </a>
        ))}
    </div>
);
