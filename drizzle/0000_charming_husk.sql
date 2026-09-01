CREATE TABLE `git_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`provider_username` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `git_connections_user_provider_account_unique` ON `git_connections` (`user_id`,`provider`,`provider_account_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `git_connections_id_user_unique` ON `git_connections` (`id`,`user_id`);--> statement-breakpoint
CREATE TABLE `repositories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`git_connection_id` text NOT NULL,
	`provider_repository_id` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`clone_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`git_connection_id`,`user_id`) REFERENCES `git_connections`(`id`,`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repositories_id_user_unique` ON `repositories` (`id`,`user_id`);--> statement-breakpoint
CREATE INDEX `repositories_user_created_at_idx` ON `repositories` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`repository_id` text NOT NULL,
	`status` text NOT NULL,
	`sandbox_provider` text NOT NULL,
	`sandbox_id` text,
	`agent_url` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	`expires_at` integer NOT NULL,
	`stopped_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`repository_id`,`user_id`) REFERENCES `repositories`(`id`,`user_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "sessions_status_check" CHECK("sessions"."status" in ('provisioning', 'running', 'stopping', 'stopped', 'expired', 'failed'))
);
--> statement-breakpoint
CREATE INDEX `sessions_user_created_at_idx` ON `sessions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sessions_status_expires_at_idx` ON `sessions` (`status`,`expires_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
