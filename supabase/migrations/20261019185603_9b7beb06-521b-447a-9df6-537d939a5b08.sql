CREATE TABLE public.orders (
  id text PRIMARY KEY,
  merchant_name text NOT NULL,
  pickup_area text NOT NULL,
  customer_area text NOT NULL,
  items_summary text NOT NULL DEFAULT '',
  total_kes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Preparing',
  pickup_lat double precision NOT NULL,
  pickup_lng double precision NOT NULL,
  drop_lat double precision NOT NULL,
  drop_lng double precision NOT NULL,
  rider_lat double precision,
  rider_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.advance_rider(order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET rider_lat = rider_lat + (drop_lat - rider_lat) * 0.12,
      rider_lng = rider_lng + (drop_lng - rider_lng) * 0.12,
      updated_at = now()
  WHERE id = order_id
    AND status IN ('In Transit', 'Out for Delivery')
    AND rider_lat IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_rider(text) TO anon;
GRANT EXECUTE ON FUNCTION public.advance_rider(text) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

INSERT INTO public.orders (id, merchant_name, pickup_area, customer_area, items_summary, total_kes, status, pickup_lat, pickup_lng, drop_lat, drop_lng, rider_lat, rider_lng) VALUES
  ('BEEZ7842', 'Mama''s Kitchen', 'Kenyatta Avenue, Mombasa', 'Links Rd, Nyali', 'Chicken Rice ×1', 1250, 'In Transit', -4.0550, 39.6680, -4.0220, 39.7150, -4.0380, 39.6900),
  ('BEEZ7841', 'Fresh Farm', 'Kizingo', 'Kizingo', 'Fresh Tomatoes ×2', 200, 'Preparing', -4.0620, 39.6620, -4.0580, 39.6600, NULL, NULL),
  ('BEEZ7840', 'Green Grocers', 'Mtwapa', 'Mtwapa', 'Bananas ×3', 150, 'Delivered', -3.9380, 39.7450, -3.9420, 39.7380, -3.9420, 39.7380),
  ('BEEZ7839', 'Kizingo Supermarket', 'Nyali', 'Nyali', 'Onions ×1', 40, 'Delivered', -4.0280, 39.7080, -4.0240, 39.7120, -4.0240, 39.7120),
  ('BEEZ7838', 'Chicken House', 'Likoni', 'Likoni', 'Cooking Oil ×2', 560, 'In Transit', -4.0830, 39.6620, -4.0920, 39.6550, -4.0860, 39.6590),
  ('BEEZ7837', 'Mama''s Kitchen', 'Mombasa CBD', 'Tudor', 'Pilau ×2', 780, 'Out for Delivery', -4.0600, 39.6700, -4.0350, 39.6850, -4.0500, 39.6760),
  ('BEEZ7836', 'Fresh Farm', 'Kongowea', 'Kisauni', 'Potatoes ×4', 240, 'Pending', -4.0050, 39.7000, -4.0100, 39.7050, NULL, NULL),
  ('BEEZ7835', 'Java House', 'Nyali', 'Bamburi', 'Coffee & Cake ×1', 420, 'Cancelled', -4.0300, 39.7100, -3.9950, 39.7350, NULL, NULL);