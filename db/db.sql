-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION postgres;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.agency_id_seq;

CREATE SEQUENCE public.agency_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.agency_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.agency_id_seq TO postgres;

-- DROP SEQUENCE public.circuit_city_id_seq;

CREATE SEQUENCE public.circuit_city_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.circuit_city_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.circuit_city_id_seq TO postgres;

-- DROP SEQUENCE public.circuit_id_seq;

CREATE SEQUENCE public.circuit_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.circuit_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.circuit_id_seq TO postgres;

-- DROP SEQUENCE public.city_id_seq;

CREATE SEQUENCE public.city_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.city_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.city_id_seq TO postgres;

-- DROP SEQUENCE public.client_id_seq;

CREATE SEQUENCE public.client_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.client_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.client_id_seq TO postgres;

-- DROP SEQUENCE public.dossier_dossier_num_seq;

CREATE SEQUENCE public.dossier_dossier_num_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.dossier_dossier_num_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.dossier_dossier_num_seq TO postgres;

-- DROP SEQUENCE public.motel_id_seq;

CREATE SEQUENCE public.motel_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.motel_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.motel_id_seq TO postgres;

-- DROP SEQUENCE public.user_id_seq;

CREATE SEQUENCE public.user_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.user_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.user_id_seq TO postgres;
-- public.agency definition

-- Drop table

-- DROP TABLE public.agency;

CREATE TABLE public.agency (
	"name" varchar NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	id serial4 NOT NULL,
	CONSTRAINT agency_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.agency OWNER TO postgres;
GRANT ALL ON TABLE public.agency TO postgres;


-- public.circuit definition

-- Drop table

-- DROP TABLE public.circuit;

CREATE TABLE public.circuit (
	"name" varchar NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	id serial4 NOT NULL,
	CONSTRAINT circuit_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.circuit OWNER TO postgres;
GRANT ALL ON TABLE public.circuit TO postgres;


-- public.city definition

-- Drop table

-- DROP TABLE public.city;

CREATE TABLE public.city (
	"name" varchar NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	id serial4 NOT NULL,
	CONSTRAINT city_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.city OWNER TO postgres;
GRANT ALL ON TABLE public.city TO postgres;


-- public.client definition

-- Drop table

-- DROP TABLE public.client;

CREATE TABLE public.client (
	ref_client varchar NULL,
	"name" varchar NOT NULL,
	category varchar NULL,
	id serial4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT client_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.client OWNER TO postgres;
GRANT ALL ON TABLE public.client TO postgres;


-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	email varchar NULL,
	id serial4 NOT NULL,
	"name" varchar NULL,
	"password" varchar NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	is_admin bool NOT NULL DEFAULT false,
	CONSTRAINT user_pkey PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public."user" OWNER TO postgres;
GRANT ALL ON TABLE public."user" TO postgres;


-- public.circuit_city definition

-- Drop table

-- DROP TABLE public.circuit_city;

CREATE TABLE public.circuit_city (
	circuit_id int8 NOT NULL,
	city_id int8 NOT NULL,
	id serial4 NOT NULL,
	number_of_nights int8 NULL DEFAULT 1,
	CONSTRAINT circuit_city_pk PRIMARY KEY (id),
	CONSTRAINT circuit_city_fk FOREIGN KEY (city_id) REFERENCES public.city(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT circuit_city_fk_1 FOREIGN KEY (circuit_id) REFERENCES public.circuit(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Permissions

ALTER TABLE public.circuit_city OWNER TO postgres;
GRANT ALL ON TABLE public.circuit_city TO postgres;


-- public.dossier definition

-- Drop table

-- DROP TABLE public.dossier;

CREATE TABLE public.dossier (
	starts_at timestamp NOT NULL,
	ends_at timestamp NOT NULL,
	circuit_id int8 NOT NULL,
	agency_id int8 NULL,
	client_id int8 NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	dossier_num serial4 NOT NULL,
	CONSTRAINT dossier_pk PRIMARY KEY (dossier_num),
	CONSTRAINT agency_fk FOREIGN KEY (agency_id) REFERENCES public.agency(id) ON DELETE SET NULL ON UPDATE SET NULL,
	CONSTRAINT client_fk FOREIGN KEY (client_id) REFERENCES public.client(id) ON DELETE SET NULL ON UPDATE SET NULL,
	CONSTRAINT dossier_fk FOREIGN KEY (circuit_id) REFERENCES public.circuit(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Permissions

ALTER TABLE public.dossier OWNER TO postgres;
GRANT ALL ON TABLE public.dossier TO postgres;


-- public.hotel definition

-- Drop table

-- DROP TABLE public.hotel;

CREATE TABLE public.hotel (
	"name" varchar NOT NULL,
	id int4 NOT NULL DEFAULT nextval('motel_id_seq'::regclass),
	updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	stars varchar NULL,
	city_id int8 NULL,
	CONSTRAINT motel_pk PRIMARY KEY (id),
	CONSTRAINT hotel_fk FOREIGN KEY (city_id) REFERENCES public.city(id) ON DELETE SET NULL ON UPDATE SET NULL
);

-- Permissions

ALTER TABLE public.hotel OWNER TO postgres;
GRANT ALL ON TABLE public.hotel TO postgres;




-- Permissions

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
