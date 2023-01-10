-- public.flight definition

-- Drop table

-- DROP TABLE public.flight;

CREATE TABLE public.flight (
	city_id_start int8 NULL,
	from_start varchar NULL,
	to_start varchar NULL,
	flight_start varchar NULL,
	flight_time_start time NULL,
	from_to_start varchar NULL,
	dossier_id int8 NULL,
	id serial4 NOT NULL,
	city_id_end int8 NULL,
	flight_end varchar NULL,
	from_end varchar NULL,
	to_end varchar NULL,
	from_to_end varchar NULL,
	flight_time_end time NULL,
	flight_date_end timestamp NULL,
	flight_date_start timestamp NULL,
	CONSTRAINT flight_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.flight OWNER TO postgres;
GRANT ALL ON TABLE public.flight TO postgres;


-- public.flight foreign keys

ALTER TABLE public.flight ADD CONSTRAINT flight_fk FOREIGN KEY (city_id_end) REFERENCES public.city(id);
ALTER TABLE public.flight ADD CONSTRAINT newtable_fk FOREIGN KEY (city_id_start) REFERENCES public.city(id);
ALTER TABLE public.flight ADD CONSTRAINT newtable_fk_1 FOREIGN KEY (dossier_id) REFERENCES public.dossier(dossier_num);