CREATE TABLE `coffee_blog_posts` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`slug` text NOT NULL,
	`title_en` text,
	`title_id` text,
	`title_cn` text,
	`excerpt_en` text DEFAULT '' NOT NULL,
	`excerpt_id` text DEFAULT '' NOT NULL,
	`excerpt_cn` text DEFAULT '' NOT NULL,
	`content_en` text DEFAULT '' NOT NULL,
	`content_id` text DEFAULT '' NOT NULL,
	`content_cn` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`author_name` text DEFAULT 'Brew Haven' NOT NULL,
	`published_at` integer DEFAULT (unixepoch()) NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coffee_blog_posts_slug_unique` ON `coffee_blog_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_coffee_blog_posts_pub` ON `coffee_blog_posts` (`is_published`,`published_at`);--> statement-breakpoint
CREATE TABLE `coffee_chefs` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role_en` text NOT NULL,
	`role_id` text NOT NULL,
	`img` text DEFAULT '' NOT NULL,
	`bio_en` text DEFAULT '' NOT NULL,
	`bio_id` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_coffee_chefs_slug` ON `coffee_chefs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_coffee_chefs_pub` ON `coffee_chefs` (`is_published`,`position`);--> statement-breakpoint
CREATE TABLE `coffee_menu_items` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`slug` text NOT NULL,
	`section` text DEFAULT 'coffee' NOT NULL,
	`title_en` text NOT NULL,
	`title_id` text NOT NULL,
	`desc_en` text DEFAULT '' NOT NULL,
	`desc_id` text DEFAULT '' NOT NULL,
	`price` text DEFAULT '' NOT NULL,
	`img` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_coffee_menu_items_slug` ON `coffee_menu_items` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_coffee_menu_items_section_pub` ON `coffee_menu_items` (`section`,`is_published`,`position`);--> statement-breakpoint
CREATE TABLE `coffee_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `coffee_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_coffee_sessions_token` ON `coffee_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `idx_coffee_sessions_user` ON `coffee_sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `coffee_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`default_language` text DEFAULT 'en' NOT NULL,
	`active_languages` text DEFAULT '["en","id","cn"]' NOT NULL,
	`google_maps_iframe` text DEFAULT '' NOT NULL,
	`opening_time` text DEFAULT '[]' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coffee_users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_coffee_users_email` ON `coffee_users` (`email`);