--
-- PostgreSQL database dump
--

\restrict VvJNKeJjLAI07PvV7mi5fjua1mpP2qAleLGFfaCGl3YVB4pDeGNcL0Zzfqnyqgv

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    role_id bigint NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, description, created_at, updated_at) FROM stdin;
1	SYSTEM_ADMIN	Quản trị hệ thống	2026-05-21 16:30:08.180933	2026-05-21 16:30:08.180933
2	FACILITY_MANAGER	Quản lý tòa nhà gửi xe	2026-05-21 16:30:08.180933	2026-05-21 16:30:08.180933
3	PARKING_STAFF	Nhân viên bãi xe	2026-05-21 16:30:08.180933	2026-05-21 16:30:08.180933
4	DRIVER	Người gửi xe	2026-05-21 16:30:08.180933	2026-05-21 16:30:08.180933
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role_id, full_name, email, phone, password_hash, status, created_at, updated_at) FROM stdin;
1	1	System Admin	admin@example.com	0900000001	$2a$12$9Mo0bhQMyzmAywY.Xtb6FOP0JxFdErI5WQjobHFVjNuadeUkKFBDS	active	2026-05-21 16:43:17.397566	2026-05-21 16:43:17.397566
2	2	Parking Manager	manager@example.com	0900000002	$2a$12$9Mo0bhQMyzmAywY.Xtb6FOP0JxFdErI5WQjobHFVjNuadeUkKFBDS	active	2026-05-21 16:43:17.397566	2026-05-21 16:43:17.397566
3	3	Parking Staff	staff@example.com	0900000003	$2a$12$9Mo0bhQMyzmAywY.Xtb6FOP0JxFdErI5WQjobHFVjNuadeUkKFBDS	active	2026-05-21 16:43:17.397566	2026-05-21 16:43:17.397566
4	4	Driver User	driver@example.com	0900000004	$2a$12$9Mo0bhQMyzmAywY.Xtb6FOP0JxFdErI5WQjobHFVjNuadeUkKFBDS	active	2026-05-21 16:43:17.397566	2026-05-21 16:43:17.397566
\.


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users fk_users_roles; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict VvJNKeJjLAI07PvV7mi5fjua1mpP2qAleLGFfaCGl3YVB4pDeGNcL0Zzfqnyqgv

