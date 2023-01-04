-- public.dossier_hotel definition

-- Drop table

-- DROP TABLE public.dossier_hotel;

CREATE TABLE public.dossier_hotel (
	hotel_id int8 NULL,
	dossier_id int8 NULL,
	number_of_nights int8 NULL,
	extra_nights int8 NULL DEFAULT 0,
	id serial4 NOT NULL,
	CONSTRAINT dossier_hotel_pk PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE public.dossier_hotel OWNER TO postgres;
GRANT ALL ON TABLE public.dossier_hotel TO postgres;


-- public.dossier_hotel foreign keys

ALTER TABLE public.dossier_hotel ADD CONSTRAINT dossier_hotel_fk FOREIGN KEY (dossier_id) REFERENCES public.dossier(dossier_num) ON DELETE SET NULL ON UPDATE SET NULL;
ALTER TABLE public.dossier_hotel ADD CONSTRAINT dossier_hotel_fk_1 FOREIGN KEY (hotel_id) REFERENCES public.hotel(id) ON DELETE SET NULL ON UPDATE SET NULL;