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
    <div className="relative p-4 w-[350px] bg-[#262626] border border-[#333333] ">
      <Show show={isLoaded}>
        <div className="">
          <div className="w-full  h-20 overflow-hidden ">
            <img
              className="mx-auto h-20 w-auto"
              src={chrome.runtime.getURL('src/assets/chat-bot-final.svg')}
              width={150}
              height={150}
              style={{
                filter: 'invert(1)',
              }}
            />
          </div>
          <div className="text-center">
            <h1 className=" font-bold text-3xl text-white">
              Chat Bot
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Go-To Companion for Problem Solving!s
            </p>
          </div>
          <form
            onSubmit={(e) => updatestorage(e)}
            className="mt-10 flex flex-col gap-2 w-full"
          >
            <div className="space-y-2">
              <label htmlFor="text" className="text-xs text-muted-foreground">
                Select a model
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
                placeholder={!selectedModel ? 'Select a model and enter API Key' : selectedModel === 'gemini_1.5_pro' ?"Enter Gemini API Key" :"Enter OpenAI API Key"}
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

  

  const [selectedModel, setSelectedModel] = useState<ValidModel | null>(null)

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
  // @ts-ignore
  const [theme,setTheme] = useState<ThemeTypes>(Themes.LIGHT);
  
  

  

  

  return (
    <div className={cn("relative p-4 w-[350px] ",
      theme === Themes.DARK ? 'bg-[#151d28] border-[1px] border-white ' : 'bg-white'
    )}>
      <Show show={isLoaded}>
        <div className="">
          <div className="w-full  h-20 overflow-hidden ">
            <img
              className="mx-auto h-20 w-auto"
              src={chrome.runtime.getURL('src/assets/chat-bot-final.svg')}
              width={150}
              height={150}
            />
          </div>
          <div className="text-center">
            <h1 className={cn(" font-bold text-3xl  ",
              theme === Themes.DARK ? 'text-white' : 'text-black'
            )}>
              Chat Bot
            </h1>
            <p className="text-sm text-muted-foreground">
              Your Go-To Companion for Problem Solving!
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
                value={selectedModel!}
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
                placeholder={!selectedModel ? 'Select a model and enter API Key' : selectedModel === 'gemini_1.5_pro' ?"Enter Gemini API Key" :"Enter OpenAI API Key"}
                disabled={!model}
                className={cn(
                  theme === Themes.DARK ? 'bg-[#151d28] dark border-[1px] border-gray-500 rounded-md' : 'bg-white text-black focus:border-[#aceaff] border-[#aceaff]'
                )}
                required
              />
            </div>
            <Button style={{
              // borderRadius:'0px',
              background:theme === Themes.LIGHT ? 'linear-gradient(90deg,#033042,#005c83)' : ''
            }} disabled={isloading} type="submit" className={cn("w-full mt-2 rounded-md",
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



export const Pop = () =>{
  const [activeSite,setActiveSite] = useState<string | null>(null);
  

  useEffect(() => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      console.log(tabs[0].url);
      
      if(tabs[0].url?.includes('leetcode')){
        setActiveSite(ORIGINS.leetcode);
      }else{
        setActiveSite(ORIGINS.maang);
      }
    });
  },[activeSite])

  return(
    <div>
      {
        activeSite ? activeSite === ORIGINS.leetcode ? <Popup/> : <MaangPopup/> : ''
      }
    </div>
  )
}