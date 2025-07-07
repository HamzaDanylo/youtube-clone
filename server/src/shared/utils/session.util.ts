import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'

import type { User } from '@/prisma/generated'

import type { SessionMetadata } from '../types/session-metadata.types'

export function saveSession(
	req: Request,
	user: User,
	metadata: SessionMetadata
) {
	return new Promise((resolve, reject) => {
		req.session.createdAt = new Date()
		req.session.userId = user.id
		req.session.metadata = metadata

		req.session.save(err => {
			if (err) {
				return reject(
					new InternalServerErrorException(
						'Не удалось сохранить сессию'
					)
				)
			}

			resolve({ user })
		})
	})
}

export async function destroySession(req: Request, configService: ConfigService) {
	return await new Promise((resolve, reject) => {
		// console.log('Session object:', req.session);
		// console.log('Destroy function:', typeof req.session?.destroy);

		req.session.destroy(err => {
			if (err) {
				console.error('Redis destroy error:', err);

				return reject(
					new InternalServerErrorException(
						'Не вдалось завершити сесію: ' + err.message
					)
				);
			}

			const res = req.res;
				if (res && !res.headersSent) {
				res.clearCookie(configService.getOrThrow<string>('SESSION_NAME'));
				}

			resolve(true);
		});
	});
}
