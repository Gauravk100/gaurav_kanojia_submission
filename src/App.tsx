import React, { useEffect, useState } from 'react'

import leetCode from '@/assets/leetcode.png'

import { Button } from '@/components/ui/button'
import Show from '@/components/Show'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectValue,
  SelectTrigger,
} from '@/components/ui/select'
import { VALID_MODELS, type ValidModel } from './constants/valid_modals'
import { HideApiKey } from '@/components/ui/input'
import { useChromeStorage } from './hooks/useChromeStorage'
import { ORIGINS, Themes, ThemeTypes } from './content/content'
import { cn } from './lib/utils'

export const Popup: React.FC = () => {
  const [apikey, setApikey] = React.useState<string | null>(null)
  const [model, setModel] = React.useState<ValidModel | null>(null)
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

  const [isloading, setIsloading] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<{
    state: 'error' | 'success'
    message: string
  } | null>(null)

  const [selectedModel, setSelectedModel] = useState<ValidModel>()

  
  

  const updatestorage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsloading(true)

      const { setKeyModel } = useChromeStorage()
      if (apikey && model) {
        await setKeyModel(apikey, model)
      }

      setSubmitMessage({
        state: 'success',
        message: 'API Key saved successfully',
      })
    } catch (error: any) {
      setSubmitMessage({
        state: 'error',
        message: error.message,
      })
    } finally {
      setIsloading(false)
    }
  }

  React.useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return

      const { selectModel, getKeyModel } = useChromeStorage()

      setModel(await selectModel())
      setSelectedModel(await selectModel())
      setApikey((await getKeyModel(await selectModel())).apiKey)

      setIsLoaded(true)
    }

    loadChromeStorage()
  }, [])

  const handleModel = async (v: ValidModel) => {
    if (v) {
      const { setSelectModel, getKeyModel, selectModel } = useChromeStorage()
      setSelectModel(v)
      setModel(v)
      setSelectedModel(v)
      setApikey((await getKeyModel(await selectModel())).apiKey)
    }
  }

  return (
    <div className="relative p-4 w-[350px] bg-background">
      <Show show={isLoaded}>
        <div className="">
          <div className="w-full  h-20 overflow-hidden ">
            <img
              className="mx-auto h-20 w-auto"
              src={leetCode}
              width={150}
              height={150}
            />
          </div>
          <div className="text-center">
            <h1 className=" font-bold text-3xl text-white">
              LeetCode <span className="text-whisperOrange">Whisper</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Companion to Beat LeetCode!
            </p>
          </div>
          <form
            onSubmit={(e) => updatestorage(e)}
            className="mt-10 flex flex-col gap-2 w-full"
          >
            <div className="space-y-2">
              <label htmlFor="text" className="text-xs text-muted-foreground">
                select a model
              </label>
              <Select
                onValueChange={(v: ValidModel) => handleModel(v)}
                value={selectedModel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Model</SelectLabel>
                    <SelectSeparator />
                    {VALID_MODELS.map((modelOption) => (
                      <SelectItem
                        key={modelOption.name}
                        value={modelOption.name}
                      >
                        {modelOption.display}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="text" className="text-xs text-muted-foreground">
                API Key {model ? `for ${model}` : ''}
              </label>
              <HideApiKey
                value={apikey || ''}
                onChange={(e) => setApikey(e.target.value)}
                placeholder="Enter OpenAI API Key"
                disabled={!model}
                required
              />
            </div>
            <Button disabled={isloading} type="submit" className="w-full mt-2">
              save API Key
            </Button>
          </form>
          {submitMessage ? (
            <div
              className="mt-2 text-center text-sm text-muted-foreground flex items-center justify-center p-2 rounded-sm"
              style={{
                color: submitMessage.state === 'error' ? 'red' : 'green',
                border:
                  submitMessage.state === 'error'
                    ? '1px solid red'
                    : '1px solid green',
                backgroundColor:
                  submitMessage.state === 'error'
                    ? 'rgba(255, 0, 0, 0.1)'
                    : 'rgba(0, 255, 0, 0.1)',
              }}
            >
              {submitMessage.state === 'error' ? (
                <p className="text-red-500">{submitMessage.message}</p>
              ) : (
                <p className="text-green-500">{submitMessage.message}</p>
              )}
            </div>
          ) : (
            ''
          )}
          <div className="mt-7 flex items-center justify-center">
            <p className="text-sm">
              Want more features?&nbsp;
              <a
                href="https://github.com/piyushgarg-dev/leetcode-whisper-chrome-extension/issues/new"
                className="text-blue-500 hover:underline"
                target="_blank"
              >
                Request a feature!
              </a>
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}

export const MaangPopup: React.FC = () => {
  const [apikey, setApikey] = React.useState<string | null>(null)
  const [model, setModel] = React.useState<ValidModel | null>(null)
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

  const [isloading, setIsloading] = useState<boolean>(false)
  const [submitMessage, setSubmitMessage] = useState<{
    state: 'error' | 'success'
    message: string
  } | null>(null)

  // @ts-ignore
  

  const [selectedModel, setSelectedModel] = useState<ValidModel>()

  const updatestorage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsloading(true)

      const { setKeyModel } = useChromeStorage()
      if (apikey && model) {
        await setKeyModel(apikey, model)
      }

      setSubmitMessage({
        state: 'success',
        message: 'API Key saved successfully',
      })
    } catch (error: any) {
      setSubmitMessage({
        state: 'error',
        message: error.message,
      })
    } finally {
      setIsloading(false)
    }
  }

  React.useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return

      const { selectModel, getKeyModel } = useChromeStorage()

      setModel(await selectModel())
      setSelectedModel(await selectModel())
      setApikey((await getKeyModel(await selectModel())).apiKey)

      setIsLoaded(true)
    }

    loadChromeStorage()
  }, [])

  const handleModel = async (v: ValidModel) => {
    if (v) {
      const { setSelectModel, getKeyModel, selectModel } = useChromeStorage()
      setSelectModel(v)
      setModel(v)
      setSelectedModel(v)
      setApikey((await getKeyModel(await selectModel())).apiKey)
    }
  }
  const [theme,setTheme] = useState<ThemeTypes>(Themes.LIGHT);
  
  useEffect(() => {
    console.log(location.origin);
    
    if(location.origin === ORIGINS.leetcode){
      return;
    }




    const setInitialTheme = () => {
      const initialTheme = document.documentElement.getAttribute('data-theme');
      if (initialTheme === 'dark'){
        setTheme(Themes.DARK);
      }else{
        setTheme(Themes.LIGHT);
      }
      
    }


    const observerCallback = (mutationsList:any) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          console.log(newTheme);
          
          if(newTheme === 'dark' ){
            setTheme(Themes.DARK);
          }else{
            setTheme(Themes.LIGHT);
          }
          
        }
      }
    };

    // Create a MutationObserver instance
    const observer = new MutationObserver(observerCallback);


    setInitialTheme();
    // Observe changes to the <html> element's attributes
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      // Cleanup: Disconnect the observer
      observer.disconnect();
    };

  },[]);

  

  

  return (
    <div className={cn("relative p-4 w-[350px] rounded-md",
      theme === Themes.DARK ? 'bg-[#151d28] border-[1px] border-white ' : 'bg-white'
    )}>
      <Show show={true}>
        <div className="">
          <div className="w-full  h-20 overflow-hidden ">
            <img
              className="mx-auto h-20 w-auto"
              src={leetCode}
              width={150}
              height={150}
            />
          </div>
          <div className="text-center">
            <h1 className={cn(" font-bold text-3xl  ",
              theme === Themes.DARK ? 'text-white' : 'text-black'
            )}>
              LeetCode <span className="text-whisperOrange">Whisper</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Companion to 
            </p>
          </div>
          <form
            onSubmit={(e) => updatestorage(e)}
            className="mt-10 flex flex-col gap-2 w-full"
          >
            <div className="space-y-2">
              <label htmlFor="text" className={cn("text-xs font-semibold",
                theme === Themes.DARK ? 'text-white' : 'text-black'
              )}>
                Select a model
              </label>
              <Select
                onValueChange={(v: ValidModel) => handleModel(v)}
                value={selectedModel}
              >
                <SelectTrigger className={cn("w-full ",
                  theme === Themes.DARK ? 'bg-[#151d28] dark border-[1px] border-gray-500 rounded-md' : 'bg-white text-black focus:border-[#aceaff] border-[#aceaff] '  
                )}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className={cn(
                  theme === Themes.DARK ? 'bg-[#151d28] dark border-[1px] border-gray-500 rounded-md' : 'bg-white text-black  border-[#aceaff]'
                )}>
                  <SelectGroup>
                    <SelectLabel>Model</SelectLabel>
                    <SelectSeparator />
                    {VALID_MODELS.map((modelOption) => (
                      <SelectItem
                        key={modelOption.name}
                        value={modelOption.name}
                      >
                        {modelOption.display}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="text" className={cn("text-xs font-semibold",
                theme === Themes.DARK ? 'text-white' : 'text-muted-foreground'
              )}>
                API Key {model ? `for ${model}` : ''}
              </label>
              <HideApiKey
                value={apikey || ''}
                onChange={(e) => setApikey(e.target.value)}
                placeholder={selectedModel === 'gemini_1.5_pro' ?"Enter Gemini API Key" :"Enter OpenAI API Key"}
                disabled={!model}
                className={cn(
                  theme === Themes.DARK ? 'bg-[#151d28] dark border-[1px] border-gray-500 rounded-md' : 'bg-white text-black focus:border-[#aceaff] border-[#aceaff]'
                )}
                required
              />
            </div>
            <Button style={{
              background:theme === Themes.LIGHT ? 'linear-gradient(90deg,#033042,#005c83)' : ''
            }} disabled={isloading} type="submit" className={cn("w-full mt-2",
              theme === Themes.LIGHT ? 'text-white' : 'text-black'
            )}>
              Save API Key
            </Button>
          </form>
          {submitMessage ? (
            <div
              className="mt-2 text-center text-sm text-muted-foreground flex items-center justify-center p-2 rounded-sm"
              style={{
                color: submitMessage.state === 'error' ? 'red' : 'green',
                border:
                  submitMessage.state === 'error'
                    ? '1px solid red'
                    : '1px solid green',
                backgroundColor:
                  submitMessage.state === 'error'
                    ? 'rgba(255, 0, 0, 0.1)'
                    : 'rgba(0, 255, 0, 0.1)',
              }}
            >
              {submitMessage.state === 'error' ? (
                <p className="text-red-500">{submitMessage.message}</p>
              ) : (
                <p className="text-green-500">{submitMessage.message}</p>
              )}
            </div>
          ) : (
            ''
          )}
          
        </div>
      </Show>
    </div>
  )
}
