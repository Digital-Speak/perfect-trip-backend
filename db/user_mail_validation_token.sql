-- public.user_mail_validation_token definition

-- Drop table

-- DROP TABLE public.user_mail_validation_token;

CREATE TABLE public.user_mail_validation_token (
	user_id int8 NULL,
	created_at timestamp NULL,
	random_token varchar NULL,
	id serial4 NOT NULL,
	CONSTRAINT user_mail_validation_token_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.user_mail_validation_token OWNER TO postgres;
GRANT ALL ON TABLE public.user_mail_validation_token TO postgres;


-- public.user_mail_validation_token foreign keys

ALTER TABLE public.user_mail_validation_token ADD CONSTRAINT user_mail_validation_token_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE;