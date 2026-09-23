--
-- PostgreSQL database dump
--

\restrict ZHDT6bTAiRbjhm21xdVybgzGvuqzWLxq9etOpBnePkSX8a1KMTBSHsXhHjThP3D

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

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
-- Name: customers; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO devuser;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO devuser;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price_cents integer NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_price_cents_check CHECK ((unit_price_cents >= 0))
);


ALTER TABLE public.order_items OWNER TO devuser;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO devuser;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'shipped'::character varying, 'delivered'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO devuser;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO devuser;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.products (
    id integer NOT NULL,
    sku character varying(64) NOT NULL,
    name character varying(255) NOT NULL,
    unit_price_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_unit_price_cents_check CHECK ((unit_price_cents >= 0))
);


ALTER TABLE public.products OWNER TO devuser;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO devuser;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: seeder_log; Type: TABLE; Schema: public; Owner: devuser
--

CREATE TABLE public.seeder_log (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.seeder_log OWNER TO devuser;

--
-- Name: seeder_log_id_seq; Type: SEQUENCE; Schema: public; Owner: devuser
--

CREATE SEQUENCE public.seeder_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seeder_log_id_seq OWNER TO devuser;

--
-- Name: seeder_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: devuser
--

ALTER SEQUENCE public.seeder_log_id_seq OWNED BY public.seeder_log.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: seeder_log id; Type: DEFAULT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.seeder_log ALTER COLUMN id SET DEFAULT nextval('public.seeder_log_id_seq'::regclass);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.customers (id, email, password_hash, created_at) FROM stdin;
1	alice@example.com	$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa	2026-09-23 12:18:56.133608+00
2	bob@example.com	$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa	2026-09-23 12:18:56.133608+00
3	carol@example.com	$2b$10$kngOZQ9tYv7ZSiOuuAQuz.WjJt4tRiDkiLnR6inOAX7sRfbFC49fa	2026-09-23 12:18:56.133608+00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price_cents) FROM stdin;
1	1	1	2	1299
2	1	2	1	4599
3	2	1	4	1299
4	3	3	3	499
5	3	2	1	4599
6	4	1	1	1299
7	4	3	2	499
8	4	4	1	1999
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.orders (id, customer_id, status, created_at) FROM stdin;
1	1	pending	2026-09-23 12:18:56.133608+00
2	1	shipped	2026-09-23 12:18:56.133608+00
3	2	delivered	2026-09-23 12:18:56.133608+00
4	3	pending	2026-09-23 12:18:56.133608+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.products (id, sku, name, unit_price_cents, created_at) FROM stdin;
1	SKU-WIDGET-001	Widget	1299	2026-09-23 12:18:56.133608+00
2	SKU-GADGET-014	Gadget	4599	2026-09-23 12:18:56.133608+00
3	SKU-CABLE-009	Cable	499	2026-09-23 12:18:56.133608+00
4	SKU-CASE-003	Case	1999	2026-09-23 12:18:56.133608+00
\.


--
-- Data for Name: seeder_log; Type: TABLE DATA; Schema: public; Owner: devuser
--

COPY public.seeder_log (id, script_name, executed_at) FROM stdin;
1	seed.sql	2026-09-23 12:18:56.133608
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.customers_id_seq', 3, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.order_items_id_seq', 8, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.orders_id_seq', 4, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.products_id_seq', 4, true);


--
-- Name: seeder_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: devuser
--

SELECT pg_catalog.setval('public.seeder_log_id_seq', 1, true);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: seeder_log seeder_log_pkey; Type: CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.seeder_log
    ADD CONSTRAINT seeder_log_pkey PRIMARY KEY (id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: devuser
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: devuser
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZHDT6bTAiRbjhm21xdVybgzGvuqzWLxq9etOpBnePkSX8a1KMTBSHsXhHjThP3D

