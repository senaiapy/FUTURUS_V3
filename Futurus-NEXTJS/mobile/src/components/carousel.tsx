/* eslint-disable max-lines-per-function */
import Env from '@env';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from './ui';

type CarouselSlide = {
  id: number;
  image: string;
  title: string;
  description: string;
};

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    image: 'carousel_1.png',
    title: '',
    description: '',
  },
  {
    id: 2,
    image: 'carousel_2.png',
    title: '',
    description: '',
  },
  {
    id: 3,
    image: 'carousel_3.png',
    title: '',
    description: 'P',
  },
  {
    id: 4,
    image: 'carousel_4.png',
    title: 'Fragancias Masculinas',
    description: 'Esencias  intensas para hombre',
  },
  {
    id: 5,
    image: 'carousel_5.png',
    title: 'Fragancias Femeninas',
    description: 'Perfumes  de lujo para mujer',
  },
  {
    id: 6,
    image: 'carousel_6.png',
    title: '',
    description: '',
  },
];

export const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % carouselSlides.length;
        scrollViewRef.current?.scrollTo({
          x: next * screenWidth,
          animated: true,
        });
        return next;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [screenWidth]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const nextSlide = () => {
    const next = (currentSlide + 1) % carouselSlides.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev
      = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    goToSlide(prev);
  };

  return (
    <View className="relative h-[200px] w-full overflow-hidden rounded-lg bg-neutral-100">
      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth,
          );
          setCurrentSlide(slideIndex);
        }}
      >
        {carouselSlides.map(slide => (
          <View
            key={slide.id}
            style={{ width: screenWidth }}
            className="relative h-[200px]"
          >
            <Image
              source={{ uri: `${Env.IMAGE_BASE_URL}/${slide.image}` }}
              className="size-full"
              contentFit="cover"
            />
            {/* Overlay with gradient */}
            <View className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            {/* Slide content */}
            <View className="absolute inset-x-0 bottom-0 p-4">
              <Text className="mb-1 text-base font-bold text-white">
                {slide.title}
              </Text>
              <Text className="text-xs text-white/90">{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Navigation arrows */}
      <TouchableOpacity
        onPress={prevSlide}
        className="absolute top-1/2 left-2 size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30"
        style={{
          transform: [{ translateY: -20 }],
        }}
      >
        <ChevronLeft size={24} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={nextSlide}
        className="absolute top-1/2 right-2 size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30"
        style={{
          transform: [{ translateY: -20 }],
        }}
      >
        <ChevronRight size={24} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Dots indicator */}
      <View className="absolute inset-x-0 bottom-2 flex-row justify-center space-x-2">
        {carouselSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            className={`size-2 rounded-full ${
              index === currentSlide ? 'bg-emerald-500' : 'bg-white/50'
            }`}
          />
        ))}
      </View>
    </View>
  );
};
