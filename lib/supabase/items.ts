import { Item } from '../types';
import { getSupabaseBrowserClient } from './client';
import { isSupabaseConfigured } from './is-configured';

export async function uploadItemImageToStorage(file: Blob, fileName: string): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const fileExt = fileName.split('.').pop() || 'jpg';
    const cleanPath = `items/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(cleanPath, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(cleanPath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Storage upload exception:', err);
    return null;
  }
}

export async function fetchItemsFromSupabase(): Promise<Item[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching items from Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return (data as Record<string, any>[]).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      subCategory: row.sub_category,
      condition: row.condition,
      description: row.description,
      targetAge: row.target_age || '',
      images: row.images || [],
      location: row.location,
      shippingMethod: row.shipping_method,
      estimatedShippingFee: row.estimated_shipping_fee,
      giverName: row.giver_name || '出品者',
      createdAt: row.created_at ? row.created_at.split('T')[0] : '',
      status: row.status,
      views: row.views || 0,
      likes: row.likes || 0
    }));
  } catch (err) {
    console.error('Failed to query Supabase items:', err);
    return null;
  }
}

export async function insertItemToSupabase(item: Item, userId?: string): Promise<Item | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('items').insert({
      user_id: userId || null,
      title: item.title,
      category: item.category,
      sub_category: item.subCategory || null,
      condition: item.condition,
      description: item.description,
      target_age: item.targetAge,
      images: item.images,
      location: item.location,
      shipping_method: item.shippingMethod,
      estimated_shipping_fee: item.estimatedShippingFee || null,
      giver_name: item.giverName,
      status: 'available',
      views: 1,
      likes: 0
    }).select().single();

    if (error) {
      console.error('Error inserting item to Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      subCategory: data.sub_category,
      condition: data.condition,
      description: data.description,
      targetAge: data.target_age || '',
      images: data.images || [],
      location: data.location,
      shippingMethod: data.shipping_method,
      estimatedShippingFee: data.estimated_shipping_fee,
      giverName: data.giver_name || '出品者',
      createdAt: data.created_at ? data.created_at.split('T')[0] : '',
      status: data.status,
      views: data.views || 0,
      likes: data.likes || 0
    };
  } catch (err) {
    console.error('Supabase item insert exception:', err);
    return null;
  }
}

export async function submitClaimToSupabase(
  itemId: string,
  recipientData: { name: string; prefecture: string; postalCode: string; address: string; phone: string },
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    // 1. Insert claim record
    const { error: claimError } = await supabase.from('claims').insert({
      item_id: itemId,
      recipient_id: userId || null,
      recipient_name: recipientData.name,
      prefecture: recipientData.prefecture,
      postal_code: recipientData.postalCode,
      address: recipientData.address,
      phone: recipientData.phone,
      agreed_cod: true,
      status: 'pending'
    });

    if (claimError) {
      console.error('Error saving claim:', claimError);
      return false;
    }

    // 2. Mark item as claimed
    const { error: itemUpdateError } = await supabase
      .from('items')
      .update({ status: 'claimed' })
      .eq('id', itemId);

    if (itemUpdateError) {
      console.warn('Could not update item status to claimed:', itemUpdateError);
    }

    return true;
  } catch (err) {
    console.error('Claim submission exception:', err);
    return false;
  }
}
